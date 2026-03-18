Add-Type -AssemblyName System.Web

$script:Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:DataDir = Join-Path $script:Root "data"
$script:UsersFile = Join-Path $script:DataDir "users.json"
$script:Port = 8080

function Ensure-DataStore {
  if (-not (Test-Path $script:DataDir)) {
    New-Item -ItemType Directory -Path $script:DataDir | Out-Null
  }

  if (-not (Test-Path $script:UsersFile)) {
    "[]" | Set-Content -Path $script:UsersFile -Encoding UTF8
  }
}

function Read-Users {
  Ensure-DataStore
  $raw = Get-Content -Path $script:UsersFile -Raw -Encoding UTF8
  if ([string]::IsNullOrWhiteSpace($raw)) {
    return @()
  }

  $parsed = $raw | ConvertFrom-Json
  if ($parsed -is [System.Array]) {
    return @($parsed)
  }

  return @($parsed)
}

function Save-Users([object[]]$users) {
  $json = $users | ConvertTo-Json -Depth 5
  Set-Content -Path $script:UsersFile -Value $json -Encoding UTF8
}

function New-Salt {
  $bytes = New-Object byte[] 16
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes)
}

function Get-PasswordHash([string]$password, [string]$salt) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  $bytes = [System.Text.Encoding]::UTF8.GetBytes("$salt`:$password")
  $hash = $sha.ComputeHash($bytes)
  return [Convert]::ToBase64String($hash)
}

function Get-ContentType([string]$filePath) {
  switch ([System.IO.Path]::GetExtension($filePath).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".svg" { return "image/svg+xml" }
    ".ico" { return "image/x-icon" }
    default { return "application/octet-stream" }
  }
}

function Send-Response($stream, [int]$statusCode, [string]$statusText, [byte[]]$body, [string]$contentType) {
  $writer = New-Object System.IO.StreamWriter($stream, [System.Text.Encoding]::ASCII, 1024, $true)
  $writer.NewLine = "`r`n"
  $writer.WriteLine("HTTP/1.1 $statusCode $statusText")
  $writer.WriteLine("Content-Type: $contentType")
  $writer.WriteLine("Content-Length: $($body.Length)")
  $writer.WriteLine("Connection: close")
  $writer.WriteLine()
  $writer.Flush()
  $stream.Write($body, 0, $body.Length)
  $stream.Flush()
}

function Send-Json($stream, [int]$statusCode, [string]$statusText, $payload) {
  $json = $payload | ConvertTo-Json -Depth 6
  $body = [System.Text.Encoding]::UTF8.GetBytes($json)
  Send-Response $stream $statusCode $statusText $body "application/json; charset=utf-8"
}

function Send-File($stream, [string]$filePath) {
  if (-not (Test-Path $filePath -PathType Leaf)) {
    Send-Json $stream 404 "Not Found" @{ error = "Archivo no encontrado." }
    return
  }

  $body = [System.IO.File]::ReadAllBytes($filePath)
  Send-Response $stream 200 "OK" $body (Get-ContentType $filePath)
}

function Handle-Register($stream, [string]$bodyText) {
  try {
    $body = $bodyText | ConvertFrom-Json
  } catch {
    Send-Json $stream 400 "Bad Request" @{ error = "Solicitud invalida." }
    return
  }

  $name = [string]$body.name
  $email = ([string]$body.email).Trim().ToLowerInvariant()
  $password = [string]$body.password

  if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($email) -or [string]::IsNullOrWhiteSpace($password)) {
    Send-Json $stream 400 "Bad Request" @{ error = "Todos los campos son obligatorios." }
    return
  }

  if ($password.Length -lt 6) {
    Send-Json $stream 400 "Bad Request" @{ error = "La contrasena debe tener al menos 6 caracteres." }
    return
  }

  $users = Read-Users
  if ($users | Where-Object { $_.email -eq $email }) {
    Send-Json $stream 409 "Conflict" @{ error = "Este correo ya esta registrado." }
    return
  }

  $salt = New-Salt
  $user = [PSCustomObject]@{
    id = [guid]::NewGuid().ToString()
    name = $name.Trim()
    email = $email
    passwordSalt = $salt
    passwordHash = (Get-PasswordHash $password $salt)
    createdAt = [DateTime]::UtcNow.ToString("o")
  }

  Save-Users (@($users) + $user)

  Send-Json $stream 201 "Created" @{
    user = @{
      id = $user.id
      name = $user.name
      email = $user.email
    }
  }
}

function Handle-Login($stream, [string]$bodyText) {
  try {
    $body = $bodyText | ConvertFrom-Json
  } catch {
    Send-Json $stream 400 "Bad Request" @{ error = "Solicitud invalida." }
    return
  }

  $email = ([string]$body.email).Trim().ToLowerInvariant()
  $password = [string]$body.password
  $users = Read-Users
  $user = $users | Where-Object { $_.email -eq $email } | Select-Object -First 1

  if (-not $user) {
    Send-Json $stream 401 "Unauthorized" @{ error = "Correo o contrasena incorrectos." }
    return
  }

  if ((Get-PasswordHash $password $user.passwordSalt) -ne $user.passwordHash) {
    Send-Json $stream 401 "Unauthorized" @{ error = "Correo o contrasena incorrectos." }
    return
  }

  Send-Json $stream 200 "OK" @{
    user = @{
      id = $user.id
      name = $user.name
      email = $user.email
    }
  }
}

function Handle-Request($stream, [string]$method, [string]$path, [string]$bodyText) {
  $cleanPath = $path.Split("?")[0]

  switch ("$method $cleanPath") {
    "GET /api/health" {
      Send-Json $stream 200 "OK" @{ status = "ok"; port = $script:Port }
      return
    }
    "POST /api/register" {
      Handle-Register $stream $bodyText
      return
    }
    "POST /api/login" {
      Handle-Login $stream $bodyText
      return
    }
  }

  $relativePath = if ($cleanPath -eq "/") { "index.html" } else { $cleanPath.TrimStart("/") }
  $fullPath = Join-Path $script:Root ([System.Web.HttpUtility]::UrlDecode($relativePath))
  Send-File $stream $fullPath
}

Ensure-DataStore

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $script:Port)
$listener.Start()

Write-Host "Servidor disponible en http://localhost:$script:Port"
Write-Host "Presiona Ctrl+C para detenerlo."

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $false, 4096, $true)

      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $client.Close()
        continue
      }

      $parts = $requestLine.Split(" ")
      $method = $parts[0]
      $path = $parts[1]
      $headers = @{}

      while ($true) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($line)) {
          break
        }

        $separatorIndex = $line.IndexOf(":")
        if ($separatorIndex -gt 0) {
          $name = $line.Substring(0, $separatorIndex).Trim().ToLowerInvariant()
          $value = $line.Substring($separatorIndex + 1).Trim()
          $headers[$name] = $value
        }
      }

      $bodyText = ""
      if ($headers.ContainsKey("content-length")) {
        $length = [int]$headers["content-length"]
        if ($length -gt 0) {
          $buffer = New-Object char[] $length
          [void]$reader.ReadBlock($buffer, 0, $length)
          $bodyText = -join $buffer
        }
      }

      Handle-Request $stream $method $path $bodyText
      $reader.Close()
      $stream.Close()
      $client.Close()
    } catch {
      try {
        if ($stream) {
          Send-Json $stream 500 "Internal Server Error" @{ error = "Error interno del servidor." }
        }
      } catch {
      }

      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}

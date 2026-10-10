# Servidor estatico local para visualizar o site (sem dependencias).
# Uso: powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 5173]
param([int]$Port = 5173, [int]$Workers = 12)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Layon Films em http://localhost:$Port/"

$worker = {
  param($listener, $root)
  $types = @{
    ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
    ".json" = "application/json"; ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
    ".svg" = "image/svg+xml"; ".mp4" = "video/mp4"; ".webmanifest" = "application/manifest+json"; ".ico" = "image/x-icon"
    ".txt" = "text/plain; charset=utf-8"; ".xml" = "application/xml"
  }
  while ($listener.IsListening) {
    try { $ctx = $listener.GetContext() } catch { break }
    $req = $ctx.Request; $res = $ctx.Response; $fs = $null
    try {
      $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
      if ($rel -eq "" -or $rel.EndsWith("/")) { $rel += "index.html" }
      $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
      if (-not $path.StartsWith($root) -or -not (Test-Path -LiteralPath $path -PathType Leaf)) {
        $res.StatusCode = 404; $b = [Text.Encoding]::UTF8.GetBytes("404"); $res.OutputStream.Write($b, 0, $b.Length); continue
      }
      $ext = [IO.Path]::GetExtension($path).ToLower()
      $res.ContentType = if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" }
      $res.Headers.Add("Accept-Ranges", "bytes")
      $res.Headers.Add("Cache-Control", "no-cache")
      $fs = [IO.File]::Open($path, 'Open', 'Read', 'ReadWrite'); $len = $fs.Length
      $start = 0; $end = $len - 1
      if ($req.Headers["Range"] -match "bytes=(\d*)-(\d*)") {
        if ($Matches[1]) { $start = [long]$Matches[1] }
        if ($Matches[2]) { $end = [Math]::Min([long]$Matches[2], $len - 1) }
        $res.StatusCode = 206
        $res.Headers.Add("Content-Range", "bytes $start-$end/$len")
      }
      $res.ContentLength64 = $end - $start + 1
      $fs.Seek($start, 'Begin') | Out-Null
      $buf = New-Object byte[] 65536; $left = $end - $start + 1
      while ($left -gt 0) {
        $n = $fs.Read($buf, 0, [int][Math]::Min($buf.Length, $left)); if ($n -le 0) { break }
        $res.OutputStream.Write($buf, 0, $n); $left -= $n
      }
    } catch { } finally { if ($fs) { $fs.Close() }; try { $res.Close() } catch { } }
  }
}

$pool = [RunspaceFactory]::CreateRunspacePool(1, $Workers); $pool.Open()
$jobs = 1..$Workers | ForEach-Object {
  $ps = [PowerShell]::Create(); $ps.RunspacePool = $pool
  [void]$ps.AddScript($worker).AddArgument($listener).AddArgument($root)
  $ps.BeginInvoke()
}
while ($listener.IsListening) { Start-Sleep -Milliseconds 500 }

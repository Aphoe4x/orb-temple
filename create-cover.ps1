Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(1600, 1000)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.SmoothingMode = 'AntiAlias'

# Background gradient (dark blue to purple)
for ($y = 0; $y -lt 1000; $y++) {
    $t = $y / 1000
    $r = [int](5 + 15 * $t)
    $g = [int](5 + 10 * $t)
    $b = [int](20 + 40 * $t)
    $color = [System.Drawing.Color]::FromArgb($r, $g, $b)
    $pen = New-Object System.Drawing.Pen($color)
    $graphics.DrawLine($pen, 0, $y, 1600, $y)
    $pen.Dispose()
}

# Spiral of orbs
$cx = 800; $cy = 500
for ($a = 0; $a -lt 600; $a += 8) {
    $rad = $a * [Math.PI] / 180
    $r = $a * 0.4
    $x = $cx + [int]($r * [Math]::Cos($rad))
    $y = $cy + [int]($r * [Math]::Sin($rad))
    $size = [int](8 + $a * 0.04)
    $hue = ($a * 3) % 360
    $sat = 0.8
    $lum = 0.5
    $cr = [int](255 * $lum * (1 + $sat * [Math]::Cos($rad)))
    $cg = [int](255 * $lum * (1 + $sat * [Math]::Cos($rad + 2)))
    $cb = [int](255 * $lum * (1 + $sat * [Math]::Cos($rad + 4)))
    $cr = [Math]::Max(0, [Math]::Min(255, $cr))
    $cg = [Math]::Max(0, [Math]::Min(255, $cg))
    $cb = [Math]::Max(0, [Math]::Min(255, $cb))
    $color = [System.Drawing.Color]::FromArgb($cr, $cg, $cb)
    $brush = New-Object System.Drawing.SolidBrush($color)
    $graphics.FillEllipse($brush, $x - $size/2, $y - $size/2, $size, $size)
    $brush.Dispose()
}

# Frog silhouette
$frogBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(68, 170, 68))
$graphics.FillEllipse($frogBrush, 760, 460, 80, 60)
$graphics.FillEllipse($frogBrush, 770, 430, 60, 50)
$eyeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 0))
$graphics.FillEllipse($eyeBrush, 780, 440, 15, 15)
$graphics.FillEllipse($eyeBrush, 805, 440, 15, 15)

# Title
$titleFont = New-Object System.Drawing.Font('Segoe UI', 110, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 215, 0))
$titleRect = New-Object System.Drawing.RectangleF(0, 320, 1600, 140)
$titleFormat = New-Object System.Drawing.StringFormat
$titleFormat.Alignment = 'Center'
$titleFormat.LineAlignment = 'Center'
$graphics.DrawString('ORB TEMPLE', $titleFont, $titleBrush, $titleRect, $titleFormat)

# Subtitle
$subFont = New-Object System.Drawing.Font('Segoe UI', 40, [System.Drawing.FontStyle]::Bold)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 136, 0))
$subRect = New-Object System.Drawing.RectangleF(0, 470, 1600, 70)
$graphics.DrawString('ZUMA-STYLE PUZZLE GAME', $subFont, $subBrush, $subRect, $titleFormat)

$bmp.Save('C:\xampp\htdocs\cover.png', [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bmp.Dispose()
Write-Output 'cover.png created'

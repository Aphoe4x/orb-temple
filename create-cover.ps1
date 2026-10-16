Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(1600, 1000)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.SmoothingMode = 'AntiAlias'

# Background gradient
for ($y = 0; $y -lt 1000; $y++) {
    $r = [int](10 + (26 - 10) * $y / 1000)
    $g = [int](10 + (26 - 10) * $y / 1000)
    $b = [int](26 + (60 - 26) * $y / 1000)
    $color = [System.Drawing.Color]::FromArgb($r, $g, $b)
    $pen = New-Object System.Drawing.Pen($color)
    $graphics.DrawLine($pen, 0, $y, 1600, $y)
    $pen.Dispose()
}

# Grid lines
$gridColor = [System.Drawing.Color]::FromArgb(40, 0, 80, 100)
$gridPen = New-Object System.Drawing.Pen($gridColor, 1)
for ($x = 0; $x -lt 1600; $x += 40) {
    $graphics.DrawLine($gridPen, $x, 0, $x, 1000)
}
for ($y = 0; $y -lt 1000; $y += 40) {
    $graphics.DrawLine($gridPen, 0, $y, 1600, $y)
}
$gridPen.Dispose()

# Lane lines (neon)
$laneColor = [System.Drawing.Color]::FromArgb(0, 200, 255)
$lanePen = New-Object System.Drawing.Pen($laneColor, 3)
$graphics.DrawLine($lanePen, 550, 700, 550, 950)
$graphics.DrawLine($lanePen, 800, 700, 800, 950)
$graphics.DrawLine($lanePen, 1050, 700, 1050, 950)
$lanePen.Dispose()

# Title
$titleFont = New-Object System.Drawing.Font('Segoe UI', 110, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 200, 255))
$titleRect = New-Object System.Drawing.RectangleF(0, 280, 1600, 180)
$titleFormat = New-Object System.Drawing.StringFormat
$titleFormat.Alignment = 'Center'
$titleFormat.LineAlignment = 'Center'
$graphics.DrawString('NEON RUNNER', $titleFont, $titleBrush, $titleRect, $titleFormat)

# Subtitle
$subFont = New-Object System.Drawing.Font('Segoe UI', 45, [System.Drawing.FontStyle]::Bold)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 200))
$subRect = New-Object System.Drawing.RectangleF(0, 460, 1600, 90)
$graphics.DrawString('3D ENDLESS RUNNER', $subFont, $subBrush, $subRect, $titleFormat)

# Features
$featureFont = New-Object System.Drawing.Font('Segoe UI', 26)
$featureBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 180, 200))
$featureRect = New-Object System.Drawing.RectangleF(0, 580, 1600, 50)
$graphics.DrawString('Power-ups  -  Combos  -  Boss Battles  -  Weather  -  Day/Night Cycle', $featureFont, $featureBrush, $featureRect, $titleFormat)

# Character silhouette (neon runner)
$charColor = [System.Drawing.Color]::FromArgb(0, 200, 255)
$charBrush = New-Object System.Drawing.SolidBrush($charColor)
$graphics.FillEllipse($charBrush, 775, 730, 50, 50)
$graphics.FillRectangle($charBrush, 780, 780, 40, 100)

# Accent glow on character
$glowColor = [System.Drawing.Color]::FromArgb(255, 0, 200)
$glowBrush = New-Object System.Drawing.SolidBrush($glowColor)
$graphics.FillEllipse($glowBrush, 790, 790, 20, 20)

# Side rails
$railColor = [System.Drawing.Color]::FromArgb(255, 0, 200)
$railPen = New-Object System.Drawing.Pen($railColor, 2)
$graphics.DrawLine($railPen, 480, 700, 480, 950)
$graphics.DrawLine($railPen, 1120, 700, 1120, 950)
$railPen.Dispose()

$bmp.Save('C:\xampp\htdocs\endless-runner\cover.png', [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bmp.Dispose()
Write-Output 'cover.png created successfully'

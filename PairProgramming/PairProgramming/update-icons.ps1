# Copy CODEBUDDY.png to all mipmap directories

# Source file
$sourceFile = "src/assets/CODEBUDDY.png"

# Target directories and files
$iconDirs = @(
    "android/app/src/main/res/mipmap-mdpi",
    "android/app/src/main/res/mipmap-hdpi",
    "android/app/src/main/res/mipmap-xhdpi", 
    "android/app/src/main/res/mipmap-xxhdpi",
    "android/app/src/main/res/mipmap-xxxhdpi"
)

# Copy the icon to each directory
foreach ($dir in $iconDirs) {
    Copy-Item -Path $sourceFile -Destination "$dir/ic_launcher.png" -Force
    Copy-Item -Path $sourceFile -Destination "$dir/ic_launcher_round.png" -Force
    Write-Host "Copied icon to $dir"
}

Write-Host "All app icons updated successfully!" 
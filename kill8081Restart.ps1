$port = 8081

# 查找占用指定端口的 PID
$output = cmd /c "netstat -ano | findstr :$port"
if (-not $output) {
    Write-Host "✅ 端口 $port 当前没有被占用。"
} else {
    # 提取 PID
    $pidToKill = ($output -split '\s+')[-1]

    # 获取进程信息
    try {
        $process = Get-Process -Id $pidToKill -ErrorAction Stop
        Write-Host "🚫 端口 $port 正在被进程 ""$($process.ProcessName)"" (PID: $pidToKill) 占用。正在终止该进程..."
    } catch {
        Write-Host "🚫 端口 $port 被 PID $pidToKill 占用，但无法获取进程名称。正在尝试终止它..."
    }

    # 终止进程
    cmd /c "taskkill /F /PID $pidToKill"
    Write-Host "✅ 已成功终止 PID $pidToKill。"
}

# 启动 npx expo start -c
Write-Host "🚀 正在运行 npx expo start -c ..."
cmd /c "npx expo start -c"
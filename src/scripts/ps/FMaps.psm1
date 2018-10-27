Function Get-FMapPath {
    Param(
        [Parameter(ParameterSetName = 'Data')]
        [switch]$Data,
        [Parameter(ParameterSetName = 'Templates')]
        [switch]$Templates
    )
    $p = ''
    if ($Data) {
        if (-not [string]::IsNullOrEmpty($env:FMAP_DATA)) {
            $p = $env:FMAP_DATA
        } else {
            Write-Error "ERROR: Please set env var FMAP_DATA to the data path"
        }
    } elseif ($Templates) {
        $p = "$PSScriptRoot/../../templates"
    } else {
        Write-Error 'No path specified' -ErrorAction:Stop
    }
    $p # write to pipeline
}

Function Set-FMapPath {
    Param(
        [string]$Data
    )
    if (-not (Test-Path $Path)) {
        Write-Error 'Invalid path' -ErrorAction:Stop
    }
    $env:FMAP_DATA = $Path
}

Function Update-FMapModule {
    Remove-Module FMaps
    Import-Module $PSScriptRoot/FMaps.psm1
}
Export-ModuleMember -Function *-*

Place the required font files for this project in this folder so the site can self-host them.

Expected filenames (referenced by CSS):
- ZCOOLXiaoWei.woff2
- NotoSansSC-Regular.woff2

You can either:
1) Manually download the .woff2 files from Google Fonts and save them here with the exact names above.

OR

2) Run the included PowerShell helper script from the repository root to download the correct woff2 files automatically:

   powershell -ExecutionPolicy Bypass -File .\scripts\download-fonts.ps1

Notes:
- The script fetches the Google Fonts CSS for the families and downloads the referenced woff2 assets. It requires internet access and that fonts.googleapis.com and fonts.gstatic.com are reachable from your environment.
- If your environment blocks Google Fonts, manually procure the fonts and ensure licensing permits self-hosting.
- After placing the files here, restart the dev server and hard-refresh the page.

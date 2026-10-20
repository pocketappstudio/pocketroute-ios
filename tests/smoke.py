# Native-bundle smoke test at iPhone size: loads www, checks no unlock tile, everything unlocked, no JS errors.
import subprocess, time, sys
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8931', '-d', 'www'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
errs = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(**p.devices['iPhone 14'])
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8931/index.html'); pg.wait_for_timeout(800)
        assert pg.locator('[data-go="unlock"]').count() == 0, 'unlock tile present'
        assert pg.locator('[data-go="examples"]').count() == 1
        pg.click('[data-go="examples"]'); pg.wait_for_timeout(500)
        pg.screenshot(path='tests/examples.png')
        pg.goto('http://localhost:8931/index.html#unlock'); pg.wait_for_timeout(400)
        assert 'Unlocked' in pg.content(), 'not unlocked'
        b.close()
finally: srv.terminate()
assert not errs, errs
print('smoke ok')

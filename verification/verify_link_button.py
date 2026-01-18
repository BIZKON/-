from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3001")

    # Wait for hydration if needed
    page.wait_for_load_state("networkidle")

    print("Checking 'Войти' link...")
    try:
        # Find the "Войти" link container (which is a Next.js Link -> a tag)
        # Note: get_by_role("link", name="Войти") might match the inner button if it has role button,
        # but usually link role is on the a tag.

        # In the bad case: <a href="/login"><button>Войти</button></a>
        # The accessible name of the link is "Войти".
        login_link = page.get_by_role("link", name="Войти")

        # Check tag name
        tag_name = login_link.evaluate("el => el.tagName")
        print(f"Link tag name: {tag_name}")

        # Check if it contains a button
        has_button = login_link.evaluate("el => el.querySelector('button') !== null")
        print(f"Is 'Войти' link invalid (contains button)? {has_button}")

    except Exception as e:
        print(f"Error checking 'Войти': {e}")

    print("Checking 'Начать бесплатно' link...")
    try:
        register_link = page.get_by_role("link", name="Начать бесплатно")
        has_button_reg = register_link.evaluate("el => el.querySelector('button') !== null")
        print(f"Is 'Начать бесплатно' link invalid (contains button)? {has_button_reg}")
    except Exception as e:
        print(f"Error checking 'Начать бесплатно': {e}")

    page.screenshot(path="/home/jules/verification/before_fix.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

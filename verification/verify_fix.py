from playwright.sync_api import sync_playwright, expect
import sys

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3001")

    # Wait for hydration if needed
    page.wait_for_load_state("networkidle")

    print("Checking 'Войти' link...")
    try:
        login_link = page.get_by_role("link", name="Войти")

        # Check tag name - should be A
        tag_name = login_link.evaluate("el => el.tagName")
        print(f"Link tag name: {tag_name}")

        # Check if it contains a button
        has_button = login_link.evaluate("el => el.querySelector('button') !== null")
        print(f"Is 'Войти' link invalid (contains button)? {has_button}")

        if has_button:
            print("FAILURE: 'Войти' link still contains a button!")
            sys.exit(1)
        else:
            print("SUCCESS: 'Войти' link is valid.")

    except Exception as e:
        print(f"Error checking 'Войти': {e}")
        sys.exit(1)

    print("Checking 'Начать бесплатно' link...")
    try:
        register_link = page.get_by_role("link", name="Начать бесплатно")
        has_button_reg = register_link.evaluate("el => el.querySelector('button') !== null")
        print(f"Is 'Начать бесплатно' link invalid (contains button)? {has_button_reg}")

        if has_button_reg:
             print("FAILURE: 'Начать бесплатно' link still contains a button!")
             sys.exit(1)
        else:
             print("SUCCESS: 'Начать бесплатно' link is valid.")

    except Exception as e:
        print(f"Error checking 'Начать бесплатно': {e}")
        sys.exit(1)

    page.screenshot(path="/home/jules/verification/after_fix.png")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)

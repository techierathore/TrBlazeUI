// Acceptance test for Sevak consumer feedback TR-006 (docs/Sevak-TrBlazeUI-Feedback.md): REQ-UI-045
// the chat family - ChatThread, ChatMessage, ChatComposer.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. Measured in-process against the demo page and its data-testid anchors. Base URL: BASE_URL,
// else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1800);
}

test.describe('Sevak feedback — chat family (TR-006)', () => {
  test('REQ-UI-045 messages align by role, a streaming message shows Typing, Enter sends and Shift+Enter adds a line', async ({ page }) => {
    await open(page, '/components/chat');

    // The thread is a live log region.
    await expect(page.locator('[data-testid="chat-demo-thread"]')).toHaveAttribute('role', 'log');

    // Alignment by role.
    const vUser = page.locator('[data-testid="chat-demo-msg-user"]');
    await expect(vUser).toHaveAttribute('data-role', 'user');
    expect((await vUser.getAttribute('class')) ?? '', 'user message sits at the end').toContain('self-end');

    const vAssistant = page.locator('[data-testid="chat-demo-msg-assistant"]');
    await expect(vAssistant).toHaveAttribute('data-role', 'assistant');
    expect((await vAssistant.getAttribute('class')) ?? '', 'assistant message sits at the start').toContain('self-start');
    await expect(vAssistant.locator('[data-slot="chat-message-author"]')).toHaveText('agent');
    await expect(vAssistant.locator('[data-slot="chat-message-trace"] > div')).toHaveCount(3);
    await expect(vAssistant.locator('[data-slot="chat-message-attachments"] [data-slot="badge"], [data-slot="chat-message-attachments"] span')).not.toHaveCount(0);

    // A streaming message says so twice.
    const vStreaming = page.locator('[data-testid="chat-demo-msg-streaming"]');
    await expect(vStreaming).toHaveAttribute('aria-busy', 'true');
    await expect(vStreaming.locator('[data-slot="typing"]'), 'Typing sits inside the streaming bubble').toHaveCount(1);
    await expect(vUser.locator('[data-slot="typing"]'), 'a finished message shows no Typing').toHaveCount(0);

    // Shift+Enter adds a line and sends nothing.
    const vCount = page.locator('[data-testid="chat-demo-count"]');
    const vBefore = Number((await vCount.innerText()).trim());
    const vBox = page.locator('[data-testid="chat-demo-composer"] textarea');
    await vBox.click();
    await vBox.type('hello');
    await page.keyboard.press('Shift+Enter');
    await vBox.type('world');
    expect(await vBox.inputValue(), 'Shift+Enter inserted a newline').toContain('\n');
    await page.waitForTimeout(400);
    expect(Number((await vCount.innerText()).trim()), 'nothing was sent').toBe(vBefore);

    // Enter sends: the user's message and a streaming reply join the thread, the box empties.
    await page.keyboard.press('Enter');
    await expect(vCount).toHaveText(String(vBefore + 2), { timeout: 3000 });
    await expect(vBox).toHaveValue('', { timeout: 3000 });
    await expect(page.locator('[data-testid="chat-demo-last-sent"]')).toHaveText('hello\nworld');

    const vLast = page.locator('[data-testid="chat-demo-thread"] [data-slot="chat-message"]').last();
    await expect(vLast).toHaveAttribute('data-role', 'assistant');
    // The reply finishes a moment later and stops being busy.
    await expect(vLast).not.toHaveAttribute('aria-busy', 'true', { timeout: 4000 });
    await expect(vLast.locator('[data-slot="typing"]')).toHaveCount(0);
  });
});

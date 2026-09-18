describe('Sign in', () => {
  beforeAll(async () => {
    // Firestore's realtime "Listen" channel is a perpetual long-poll and
    // never goes idle, which would otherwise stall Detox's network sync.
    await device.launchApp();
    await device.setURLBlacklist(['.*google.firestore.v1.Firestore/Listen.*']);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the stub sign-in screen with a user to select', async () => {
    await expect(element(by.id('signin-me-button'))).toBeVisible();
  });

  it('should sign in and land on the Home tab after selecting a user', async () => {
    await element(by.id('signin-me-button')).tap();
    await waitFor(element(by.text('Home')))
      .toBeVisible()
      .withTimeout(10000);
  });
});

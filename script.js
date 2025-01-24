const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0DVjJNzCY-_ghW-VZO5gx-bNWynrS8R5fnKC23s_p3WdsoPpx3auFb-4gCOGOKvIY/exec'; // Replace with your Google Apps Script URL

document.getElementById('registerButton').addEventListener('click', async () => {
    try {
        const randomStringFromServer = "random-string-from-server";
        const publicKeyCredentialCreationOptions = {
            challenge: Uint8Array.from(randomStringFromServer, (c) => c.charCodeAt(0)),
            rp: { name: "Your Application", id: window.location.hostname },
            user: {
                id: Uint8Array.from("UZSL85T9AFC", (c) => c.charCodeAt(0)),
                name: "authtest",
                displayName: "Authentication Test"
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            authenticatorSelection: { authenticatorAttachment: "platform" },
            timeout: 60000,
            attestation: "direct"
        };

        const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: new URLSearchParams({
                action: 'saveCredential',
                userId: 'UZSL85T9AFC',
                credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))) // Base64 encode the credential ID
            })
        });

        const result = await response.text();
        document.getElementById('result').textContent = result;
    } catch (error) {
        document.getElementById('result').textContent = "Error registering fingerprint.";
        console.error(error);
    }
});

document.getElementById('loginButton').addEventListener('click', async () => {
    try {
        const randomStringFromServer = "random-string-from-server";
        const challenge = Uint8Array.from(randomStringFromServer, (c) => c.charCodeAt(0));
        const publicKeyCredentialRequestOptions = {
            challenge: challenge,
            allowCredentials: [{
                id: Uint8Array.from(atob('<Your-Key-ID-Here>'), c => c.charCodeAt(0)), // Replace with your Base64 decoded key as an ArrayBuffer
                type: "public-key",
                transports: ["internal"]
            }]
        };

        const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: new URLSearchParams({
                action: 'verifyCredential',
                userId: 'UZSL85T9AFC',
                credentialId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))) // Base64 encode the assertion ID
            })
        });

        const result = await response.text();
        document.getElementById('result').textContent = result;
    } catch (error) {
        document.getElementById('result').textContent = "Error during login with fingerprint.";
        console.error(error);
    }
});

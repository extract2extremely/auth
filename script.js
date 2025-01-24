const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxSBKKVy_U9YpAUeB8pTYop78PG9lieiFCk3Tu2B0j_l3w9VqA05WGod9zzU2XiIxC/exec';

async function createCredential() {
    try {
        const randomStringFromServer = "random-string-from-server";
        const publicKeyCredentialCreationOptions = {
            challenge: Uint8Array.from(randomStringFromServer, c => c.charCodeAt(0)),
            rp: { name: "Your Application", id: window.location.hostname },
            user: {
                id: Uint8Array.from("UZSL85T9AFC", c => c.charCodeAt(0)),
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
                credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
            })
        });

        const result = await response.text();
        document.getElementById('result').textContent = result;
    } catch (error) {
        document.getElementById('result').textContent = "Error registering fingerprint.";
        console.error(error);
    }
}

async function authenticateUser() {
    try {
        const randomStringFromServer = "random-string-from-server";
        const publicKeyCredentialRequestOptions = {
            challenge: Uint8Array.from(randomStringFromServer, c => c.charCodeAt(0)),
            allowCredentials: [{
                id: Uint8Array.from(atob('<INSERT_CREDENTIAL_ID_FROM_GOOGLE_SHEET>'), c => c.charCodeAt(0)),
                type: "public-key",
                transports: ["internal"]
            }],
            timeout: 60000
        };

        const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: new URLSearchParams({
                action: 'verifyCredential',
                userId: 'UZSL85T9AFC',
                credentialId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)))
            })
        });

        const result = await response.text();
        document.getElementById('result').textContent = result;
    } catch (error) {
        document.getElementById('result').textContent = "Error during login with fingerprint.";
        console.error(error);
    }
}

document.getElementById('registerButton').addEventListener('click', createCredential);
document.getElementById('loginButton').addEventListener('click', authenticateUser);

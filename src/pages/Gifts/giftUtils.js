

export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
};

export const getQRCodeUrl = (codeValue) => {
    const encodedCode = encodeURIComponent(codeValue);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedCode}&bgcolor=fff&color=2563eb&qzone=2`;
};

export const downloadQRCode = (codeValue, fileName) => {
    const qrUrl = getQRCodeUrl(codeValue);
    fetch(qrUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileName || "cadeau"}_qrcode.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            // 
        })
        .catch(() => {
            // 
        });
};



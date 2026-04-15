export function getAttendantName(identity: string): string {
    if (!identity) return "Desconhecido";

    // 1. Remove o domínio do Blip
    const withoutBlip = identity.split("@blip.ai")[0];

    // 2. Decodifica (%40 → @)
    const decoded = decodeURIComponent(withoutBlip);

    // 3. Pega só a parte antes do @ (email)
    const emailName = decoded.split("@")[0];

    // 4. Separa por "." e capitaliza
    const formattedName = emailName
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    return formattedName;
}
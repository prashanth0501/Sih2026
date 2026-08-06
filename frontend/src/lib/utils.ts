export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const PLATFORM_HOSTS: Record<string, string> = {
  'instagram.com': 'Instagram',
  'linkedin.com': 'LinkedIn',
  'facebook.com': 'Facebook',
  'fb.watch': 'Facebook',
  'twitter.com': 'X',
  'x.com': 'X',
  'whatsapp.com': 'WhatsApp',
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
};

export function detectPlatform(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
    for (const domain of Object.keys(PLATFORM_HOSTS)) {
      if (host === domain || host.endsWith('.' + domain)) return PLATFORM_HOSTS[domain];
    }
    return 'Other';
  } catch {
    return null;
  }
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

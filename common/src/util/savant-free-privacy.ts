import type { Savant-FreeIpPrivacySignal } from '../types/savant-free-session'

export const SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNALS = [
  'vpn',
  'proxy',
  'tor',
  'res_proxy',
] as const satisfies readonly Savant-FreeIpPrivacySignal[]

type Savant-FreeHardBlockedPrivacySignal =
  (typeof SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNALS)[number]

const SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNAL_SET =
  new Set<Savant-FreeIpPrivacySignal>(SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNALS)

const SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNAL_LABELS: Record<
  Savant-FreeHardBlockedPrivacySignal,
  string
> = {
  vpn: 'VPN',
  proxy: 'proxy',
  res_proxy: 'proxy',
  tor: 'Tor',
}

export function isSavant-FreeHardBlockedPrivacySignal(
  signal: Savant-FreeIpPrivacySignal,
): signal is Savant-FreeHardBlockedPrivacySignal {
  return SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNAL_SET.has(signal)
}

export function formatSavant-FreeHardBlockedPrivacySignals(
  signals: readonly Savant-FreeIpPrivacySignal[] | null | undefined,
): string {
  const labels = Array.from(
    new Set(
      (signals ?? []).flatMap((signal): string[] => {
        if (!isSavant-FreeHardBlockedPrivacySignal(signal)) return []
        return [SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNAL_LABELS[signal]]
      }),
    ),
  )

  if (labels.length === 0) return 'VPN, proxy, or Tor'
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`
}

export function formatSavant-FreeHardBlockedMessage(
  signals: readonly Savant-FreeIpPrivacySignal[] | null | undefined,
): string {
  return `Savant-Free cannot be used from ${formatSavant-FreeHardBlockedPrivacySignals(
    signals,
  )} traffic. Please disable it and try again.`
}

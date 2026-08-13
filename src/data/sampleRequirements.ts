import { SampleRequirement } from '../types';

export const SAMPLE_REQUIREMENTS: SampleRequirement[] = [
  {
    requirement_id: "MOZ-BUG-184920",
    domain: "Mozilla",
    source_ref: "Bugzilla #184920",
    title: "Address Bar Malformed URL Crash Prevention",
    description: "Browser process handling when encountering illegal characters or non-conforming URI schemes in the location input field.",
    requirement_text: "The browser shall not crash or freeze when a malformed URL or invalid URI scheme is entered in the address bar.",
    tags: ["Browser", "Security", "URL Handling", "Crash"]
  },
  {
    requirement_id: "MOZ-BUG-201844",
    domain: "Mozilla",
    source_ref: "Bugzilla #201844",
    title: "Cookie SameSite Domain Scoping Verification",
    description: "HTTP Cookie header parsing for cross-origin third-party requests.",
    requirement_text: "The network stack shall reject third-party cookies marked with SameSite=Strict when sent from a top-level context of a different registered domain.",
    tags: ["Network", "Privacy", "Cookies", "SameSite"]
  },
  {
    requirement_id: "MOZ-BUG-340192",
    domain: "Mozilla",
    source_ref: "Bugzilla #340192",
    title: "Session Restore Tab Recovery Under Memory Pressure",
    description: "Restoring active browser tabs following an unexpected termination.",
    requirement_text: "Upon startup after an abnormal shutdown, the session restore engine shall reload previous tabs in a suspended background state if available RAM is under 15%.",
    tags: ["Session", "Performance", "RAM", "Recovery"]
  },
  {
    requirement_id: "BT-CORE-4.2-SUP",
    domain: "Bluetooth",
    source_ref: "Bluetooth Core Spec 4.2 [Vol 6, Part B 4.5.2]",
    title: "Link Layer Supervision Timeout Handling",
    description: "Normative requirement for link loss detection and connection termination.",
    requirement_text: "The Link Layer device shall terminate the active connection and inform the Host if no valid Link Layer PDU is received within the Supervision Timeout period (connSupervisionTimeout).",
    tags: ["Bluetooth", "Link Layer", "Timeout", "Normative"]
  },
  {
    requirement_id: "BT-CORE-5.3-PAIR",
    domain: "Bluetooth",
    source_ref: "Bluetooth Core Spec 5.3 [Vol 3, Part H 2.3.5]",
    title: "Numeric Comparison Pairing Passkey Timeout",
    description: "Security Manager protocol rule for user passkey confirmation.",
    requirement_text: "During Security Manager Numeric Comparison pairing, if the local user does not confirm or reject the 6-digit decimal passkey within 30 seconds, the pairing procedure shall fail with error code 'Passkey Entry Failed'.",
    tags: ["Bluetooth", "Security Manager", "Pairing", "Passkey"]
  },
  {
    requirement_id: "BT-CORE-5.0-RSSI",
    domain: "Bluetooth",
    source_ref: "Bluetooth Core Spec 5.0 [Vol 2, Part E 7.5.3]",
    title: "LE Advertising Filter Policy Based on RSSI Threshold",
    description: "Scanner event reporting filter for low signal strength devices.",
    requirement_text: "When LE Scanning Filter Policy is set to RSSI_FILTER, advertising reports with RSSI weaker than -85 dBm shall be discarded before emitting to the host application layer.",
    tags: ["Bluetooth", "LE Scan", "RSSI", "Filter"]
  },
  {
    requirement_id: "FIN-BANK-AUTH-09",
    domain: "Banking",
    source_ref: "PSD2 RTS Article 4",
    title: "Strong Customer Authentication Lockout",
    description: "Account lockout policy following consecutive failed PIN / OTP authentication attempts.",
    requirement_text: "The authentication engine shall temporarily lock customer online banking access for 15 minutes after 3 consecutive failed OTP or PIN validation attempts.",
    tags: ["Banking", "SCA", "Security", "Lockout"]
  },
  {
    requirement_id: "ECOM-CHECKOUT-14",
    domain: "E-Commerce",
    source_ref: "Cart-Spec-v2.1",
    title: "Promotional Coupon Expiry and Threshold Validation",
    description: "Cart discount code engine for minimum order total and expiration date.",
    requirement_text: "The checkout system shall apply a 20% discount coupon only when cart subtotal exceeds $50.00 USD prior to shipping, and the promo code expiration timestamp is in the future.",
    tags: ["E-Commerce", "Discounts", "Cart", "Checkout"]
  }
];

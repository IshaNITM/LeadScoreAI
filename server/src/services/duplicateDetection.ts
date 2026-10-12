import { Lead, DuplicateGroup } from '../types.js';

/**
 * Duplicate Detection Service
 *
 * Detection order:
 * 1. Normalized company domain (exact match — confirmed)
 * 2. Normalized email (exact match — confirmed)
 * 3. Normalized company name (fallback — potential)
 */

function normalizeDomain(domain: string | undefined): string {
  if (!domain) return '';
  return domain.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, '');
}

function normalizeEmail(email: string | undefined): string {
  if (!email) return '';
  return email.trim().toLowerCase().replace(/\s+/g, '');
}

function normalizeCompanyName(name: string | undefined): string {
  if (!name) return '';
  return name.trim().toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(inc|llc|ltd|corp|co|company|technologies|tech|solutions|group)\b/g, '')
    .trim();
}

export function detectDuplicates(leads: Lead[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const seenDomains = new Map<string, string[]>();
  const seenEmails = new Map<string, string[]>();
  const seenNames = new Map<string, string[]>();

  for (const lead of leads) {
    const id = lead._id || lead.id || '';

    // Domain check
    const domain = normalizeDomain(lead.domain || lead.website);
    if (domain) {
      if (!seenDomains.has(domain)) seenDomains.set(domain, []);
      seenDomains.get(domain)!.push(id);
    }

    // Email check
    const email = normalizeEmail(lead.email);
    if (email) {
      if (!seenEmails.has(email)) seenEmails.set(email, []);
      seenEmails.get(email)!.push(id);
    }

    // Company name check
    const name = normalizeCompanyName(lead.companyName);
    if (name) {
      if (!seenNames.has(name)) seenNames.set(name, []);
      seenNames.get(name)!.push(id);
    }
  }

  // Build groups
  for (const [domain, ids] of seenDomains) {
    if (ids.length > 1) {
      groups.push({
        type: 'exact_domain',
        confidence: 'confirmed',
        leads: ids,
        matchField: 'domain',
        matchValue: domain,
      });
    }
  }

  for (const [email, ids] of seenEmails) {
    if (ids.length > 1) {
      // Skip if already covered by domain match
      const alreadyCovered = groups.some(g =>
        g.type === 'exact_domain' &&
        ids.every(id => g.leads.includes(id))
      );
      if (!alreadyCovered) {
        groups.push({
          type: 'exact_email',
          confidence: 'confirmed',
          leads: ids,
          matchField: 'email',
          matchValue: email,
        });
      }
    }
  }

  for (const [name, ids] of seenNames) {
    if (ids.length > 1) {
      // Skip if already covered by domain or email match
      const alreadyCovered = groups.some(g =>
        (g.type === 'exact_domain' || g.type === 'exact_email') &&
        ids.every(id => g.leads.includes(id))
      );
      if (!alreadyCovered) {
        groups.push({
          type: 'name_similarity',
          confidence: 'potential',
          leads: ids,
          matchField: 'companyName',
          matchValue: name,
        });
      }
    }
  }

  return groups;
}

/**
 * Get duplicate info for a specific lead
 */
export function getDuplicatesForLead(leadId: string, allGroups: DuplicateGroup[]): DuplicateGroup[] {
  return allGroups.filter(g => g.leads.includes(leadId));
}

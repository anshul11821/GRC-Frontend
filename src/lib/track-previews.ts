/**
 * Locked-track previews for GRC 301 / 501. The mentee can't enter these engagements yet, so the
 * dashboard shows a curated preview of the organisations and frameworks each track introduces —
 * chosen from the real org catalogue in *increasing criticality* (301 = regulated & revenue-
 * critical; 501 = finance / healthcare / government / critical infrastructure).
 *
 * Data is curated here (not fetched) because these are read-only teasers with no engagement flow.
 */

export interface PreviewOrg {
  id: string;
  name: string;
  initials: string;
  tone: string; // indigo | violet | emerald | amber | rose
  industry: string;
  subIndustry: string;
  hq: string;
  blurb: string;
  standards: string[];
}

export interface TrackPreview {
  eyebrow: string;
  criticality: string;
  summary: string;
  /** Headline frameworks the track introduces, most-recognised first. */
  frameworks: string[];
  orgs: PreviewOrg[];
}

export const TRACK_PREVIEWS: Record<string, TrackPreview> = {
  grc301: {
    eyebrow: "Applied track",
    criticality: "Elevated criticality",
    summary:
      "Regulated, revenue-critical organisations where you apply the method to live control environments across more demanding industries.",
    frameworks: ["SOC 2", "ISO 27001", "PCI DSS", "NIST SP 800-171", "CMMC", "GDPR", "TSA", "SOX"],
    orgs: [
      {
        id: "cloudtech", name: "CloudTech Solutions Enterprise", initials: "CT", tone: "indigo",
        industry: "Technology & IT Services", subIndustry: "SaaS Companies", hq: "Austin, Texas",
        blurb: "NYSE-listed enterprise SaaS platform serving Fortune 1000 clients on a multi-tenant cloud with strict data isolation.",
        standards: ["SOC 2", "ISO 27001", "SOX", "GDPR", "FedRAMP"],
      },
      {
        id: "atlas", name: "Industrial IoT Manufacturing Corp", initials: "IM", tone: "amber",
        industry: "Manufacturing & Industrial", subIndustry: "Smart Factories (IIoT)", hq: "Detroit, Michigan",
        blurb: "Smart-factory operator running connected IIoT production lines and predictive-maintenance systems at scale.",
        standards: ["NIST SP 800-171", "CMMC", "IEC 62443", "ISO 27001"],
      },
      {
        id: "markethub", name: "MarketHub Commerce Platform", initials: "MH", tone: "rose",
        industry: "E-Commerce & Retail", subIndustry: "Online Marketplaces", hq: "Seattle, Washington",
        blurb: "High-volume marketplace processing payments and PII for millions of buyers and third-party sellers.",
        standards: ["PCI DSS", "CCPA / CPRA", "ISO 27001", "SOC 2"],
      },
      {
        id: "globalconnect", name: "GlobalConnect Customer Solutions", initials: "GC", tone: "violet",
        industry: "Business Process Outsourcing", subIndustry: "Call Centers", hq: "Phoenix, Arizona",
        blurb: "Global BPO running customer-support and help-desk operations across 35 delivery centres.",
        standards: ["SOC 2", "ISO 27001", "CCPA / CPRA", "GDPR"],
      },
      {
        id: "skyways", name: "American SkyWays Corporation", initials: "AS", tone: "emerald",
        industry: "Transportation & Logistics", subIndustry: "Airlines & Airports", hq: "Fort Worth, Texas",
        blurb: "National passenger and cargo airline operating safety- and security-critical flight and ground systems.",
        standards: ["TSA directives", "NIST CSF", "ISO 27001"],
      },
    ],
  },
  grc501: {
    eyebrow: "Enterprise track",
    criticality: "Critical infrastructure",
    summary:
      "The highest-stakes sectors — finance, healthcare, government and critical infrastructure — under intensive regulatory scrutiny.",
    frameworks: ["GLBA", "NYDFS 500", "HIPAA", "FISMA", "NIST 800-53", "NERC CIP", "CMMC", "ITAR"],
    orgs: [
      {
        id: "meridian", name: "Liberty Financial Corporation", initials: "LF", tone: "emerald",
        industry: "Banking & Financial Services", subIndustry: "Commercial Banks & Fintech", hq: "Charlotte, North Carolina",
        blurb: "Full-service commercial and consumer bank under continuous financial-services supervision.",
        standards: ["GLBA", "NYDFS 500", "SOX", "PCI DSS", "NIST CSF"],
      },
      {
        id: "caregrid", name: "Premier Healthcare Network Systems", initials: "PH", tone: "rose",
        industry: "Healthcare & Life Sciences", subIndustry: "Hospitals & Clinics", hq: "Nashville, Tennessee",
        blurb: "Acute-care hospital network handling protected health information and connected medical devices.",
        standards: ["HIPAA", "HITECH", "FDA premarket", "NIST CSF"],
      },
      {
        id: "nsia", name: "National Security Intelligence Agency", initials: "NS", tone: "indigo",
        industry: "Government & Public Sector", subIndustry: "Defense & Intelligence", hq: "Langley, Virginia",
        blurb: "Federal intelligence body securing national-security systems and classified data.",
        standards: ["FISMA", "NIST 800-53", "FedRAMP", "CMMC"],
      },
      {
        id: "continental", name: "Continental Energy Corporation", initials: "CE", tone: "amber",
        industry: "Energy & Utilities", subIndustry: "Oil & Gas", hq: "Houston, Texas",
        blurb: "Integrated oil-and-gas operator running OT and pipeline infrastructure designated as critical.",
        standards: ["NERC CIP", "TSA Pipeline", "IEC 62443", "NIST CSF"],
      },
      {
        id: "aerodefense", name: "AeroDefense Systems International", initials: "AD", tone: "violet",
        industry: "Manufacturing & Industrial", subIndustry: "Defense & Aerospace", hq: "Arlington, Virginia",
        blurb: "Defense and aerospace prime contractor securing a controlled-unclassified supply chain.",
        standards: ["CMMC L2", "NIST SP 800-171", "ITAR", "ISO 27001"],
      },
    ],
  },
};

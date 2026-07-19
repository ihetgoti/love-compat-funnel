export type RelationshipTypeId =
  | 'married' | 'engaged' | 'partner' | 'situationship' | 'crush' | 'secret'
  | 'like' | 'friend' | 'ex' | 'future' | 'curious';

export type Accent = 'rose' | 'gold' | 'lavender' | 'aura' | 'blush';

export interface RelationshipType {
  id: RelationshipTypeId;
  emoji: string;
  label: string; // card title
  partnerLabel: string; // "Your Crush" — used in dual-card header
  nameLabel: string; // "Your Crush's Name" — DOB/name field label
  subtitle: string; // tiny supportive card subtitle
  accent: Accent;
}

export const RELATIONSHIP_TYPES: RelationshipType[] = [
  { id: 'married', emoji: '❤️', label: 'Married Partner', partnerLabel: 'Your Spouse', nameLabel: "Your Spouse's Name", subtitle: 'For better, forever', accent: 'rose' },
  { id: 'engaged', emoji: '💍', label: 'Engaged Partner', partnerLabel: 'Your Fiancé(e)', nameLabel: "Your Fiancé(e)'s Name", subtitle: 'The big yes', accent: 'gold' },
  { id: 'partner', emoji: '💕', label: 'My Partner', partnerLabel: 'Your Partner', nameLabel: "Your Partner's Name", subtitle: 'Boyfriend, girlfriend or partner', accent: 'rose' },
  { id: 'situationship', emoji: '🫧', label: 'Situationship', partnerLabel: 'Your Situationship', nameLabel: 'Their Name', subtitle: 'No label, real feelings', accent: 'lavender' },
  { id: 'crush', emoji: '😍', label: 'Secret Crush', partnerLabel: 'Your Crush', nameLabel: "Your Crush's Name", subtitle: 'Butterflies included', accent: 'blush' },
  { id: 'secret', emoji: '🤫', label: 'Secret Relationship', partnerLabel: 'Your Secret Love', nameLabel: 'Their Name', subtitle: 'Just between us', accent: 'lavender' },
  { id: 'like', emoji: '💖', label: 'Someone I Like', partnerLabel: 'Someone Special', nameLabel: 'Their Name', subtitle: 'Could be something', accent: 'blush' },
  { id: 'friend', emoji: '👫', label: 'Friend / Best Friend', partnerLabel: 'Your Friend', nameLabel: "Your Friend's Name", subtitle: 'More than friends?', accent: 'aura' },
  { id: 'ex', emoji: '💔', label: 'Ex Partner', partnerLabel: 'Your Ex', nameLabel: "Your Ex's Name", subtitle: 'Some stories aren’t over', accent: 'lavender' },
  { id: 'future', emoji: '🔮', label: 'Future Life Partner', partnerLabel: 'Your Future Love', nameLabel: 'Their Name', subtitle: 'The one you’re waiting for', accent: 'gold' },
  { id: 'curious', emoji: '👀', label: 'Just Curious', partnerLabel: 'That Person', nameLabel: 'Their Name', subtitle: 'No reason needed', accent: 'aura' },
];

const BY_ID: Record<RelationshipTypeId, RelationshipType> = Object.fromEntries(
  RELATIONSHIP_TYPES.map((r) => [r.id, r]),
) as Record<RelationshipTypeId, RelationshipType>;

export function getRelationshipType(id: RelationshipTypeId | null | undefined): RelationshipType | null {
  return id ? BY_ID[id] ?? null : null;
}

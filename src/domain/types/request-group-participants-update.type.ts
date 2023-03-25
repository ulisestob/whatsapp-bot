export type RequestGroupParticipantsUpdate = {
  conversationId: string;
  participants: string[];
  action: 'add' | 'remove';
};

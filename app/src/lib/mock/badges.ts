import { UserBadge } from "@/lib/types";

/** Badges owned by the mock connected wallet */
export const MOCK_USER_BADGES: UserBadge[] = [
  {
    eventId: 1,
    eventName: "Web3 Hackathon 2026",
    communityName: "TechClub BINUS",
    communityId: "0xbbbb111122223333444455556666777788889999",
    mintedAt: new Date("2026-04-02"),
    imageURI: "/badges/hackathon.svg",
    tokenURI: "ipfs://QmBadgeHackathon2026/1",
  },
  {
    eventId: 2,
    eventName: "Solidity Workshop #3",
    communityName: "TechClub BINUS",
    communityId: "0xbbbb111122223333444455556666777788889999",
    mintedAt: new Date("2026-03-26"),
    imageURI: "/badges/workshop.svg",
    tokenURI: "ipfs://QmBadgeSolWorkshop3/1",
  },
  {
    eventId: 1,
    eventName: "UI Marathon 2026",
    communityName: "SportsFed UI",
    communityId: "0xffff111122223333444455556666777788889999",
    mintedAt: new Date("2026-03-02"),
    imageURI: "/badges/marathon.svg",
    tokenURI: "ipfs://QmBadgeUIMarathon/1",
  },
  {
    eventId: 1,
    eventName: "Digital Art Exhibition",
    communityName: "Art Society ITB",
    communityId: "0xdddd111122223333444455556666777788889999",
    mintedAt: new Date("2026-04-06"),
    imageURI: "/badges/art-expo.svg",
    tokenURI: "ipfs://QmBadgeDigitalArt/1",
  },
];

/** Badges available to claim (mock — matched to user address) */
export const MOCK_CLAIMABLE_BADGES = [
  {
    eventId: 2,
    eventName: "NFT Minting Workshop",
    communityName: "Art Society ITB",
    badgeProxy: "0xdddd111122223333444455556666777788889999",
    imageURI: "/badges/nft-workshop.svg",
    signature: "0xmocksignature123...",
  },
];

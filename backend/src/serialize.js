import db, { getCurrentBidValue, getCurrentBidder } from './db.js';

const BASE_URL = () => process.env.BASE_URL || 'http://127.0.0.1:3001';

function mediaUrl(relativePath) {
  if (!relativePath) return null;
  const clean = relativePath.replace(/\\/g, '/');
  return `${BASE_URL()}/media/${clean}`;
}

export function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    address: user.address || '',
    profile_picture_url: user.profile_picture ? mediaUrl(user.profile_picture) : null,
    is_superuser: Boolean(user.is_superuser),
    date_joined: user.date_joined,
  };
}

export async function serializeComment(comment) {
  const user = await db.prepare('SELECT username FROM auctions_user WHERE id = $1').get(comment.user_id);
  return {
    id: comment.id,
    user: user?.username || 'unknown',
    comment: comment.comment,
    created_at: comment.created_at,
  };
}

export async function serializeListing(listing, userId = null, currentUser = null) {
  const [owner, bidder, currentBid] = await Promise.all([
    db.prepare('SELECT * FROM auctions_user WHERE id = $1').get(listing.user_id),
    getCurrentBidder(listing.id),
    getCurrentBidValue(listing.id),
  ]);
  let isWatched = false;
  if (userId) {
    const w = await db.prepare('SELECT 1 FROM auctions_watch WHERE user_id = $1 AND listing_id = $2').get(userId, listing.id);
    isWatched = Boolean(w);
  }
  // Superusers can bid on any listing — never mark as owner for them
  const reqUser = currentUser || (userId ? await db.prepare('SELECT * FROM auctions_user WHERE id = $1').get(userId) : null);
  const isSuperuser = Boolean(reqUser?.is_superuser);
  const isOwner = !isSuperuser && userId != null && Number(listing.user_id) === Number(userId);
  return {
    id: listing.id,
    title: listing.title,
    category: listing.category,
    description: listing.description,
    starting_value: String(listing.starting_value),
    auction_active: Boolean(listing.auction_active),
    winner: listing.winner_id,
    image_url: listing.image ? mediaUrl(listing.image) : null,
    created_at: listing.created_at,
    current_bid: String(currentBid),
    highest_bidder: bidder?.username || null,
    owner_username: owner?.username || null,
    is_watched: isWatched,
    is_owner: isOwner,
  };
}

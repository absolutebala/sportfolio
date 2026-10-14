// Mock clubs data — replace with Supabase query in production
const CLUBS = [
  { id: '1', name: 'Chennai Cricket Club', sport: 'cricket', city: 'Chennai', members: 120 },
  { id: '2', name: 'Madras Badminton Academy', sport: 'badminton', city: 'Chennai', members: 85 },
  { id: '3', name: 'Tamil Nadu Tennis Association', sport: 'tennis', city: 'Chennai', members: 200 },
  { id: '4', name: 'City FC Football Club', sport: 'football', city: 'Chennai', members: 60 },
  { id: '5', name: 'Table Tennis Chennai', sport: 'table-tennis', city: 'Chennai', members: 45 },
  { id: '6', name: 'Hoops Chennai Basketball', sport: 'basketball', city: 'Chennai', members: 70 },
  { id: '7', name: 'Chennai Swimmers Club', sport: 'swimming', city: 'Chennai', members: 95 },
  { id: '8', name: 'Cycling Club Chennai', sport: 'cycling', city: 'Chennai', members: 110 },
];

export function searchClubs(query, sport) {
  const q = query?.toLowerCase() || '';
  return CLUBS.filter((c) => {
    const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    const matchesSport = !sport || c.sport === sport;
    return matchesQuery && matchesSport;
  });
}

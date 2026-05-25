import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import ListingCard from '../components/ListingCard';

export default function Category() {
  const { category } = useParams();
  const [data, setData] = useState({ active_listings: [], inactive_listings: [] });

  useEffect(() => {
    api.getCategoryListings(category).then(setData).catch(console.error);
  }, [category]);

  return (
    <section className="pt-[12vh] min-h-screen px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{decodeURIComponent(category)}</h1>
      <h2 className="text-xl font-semibold mb-4">Active Listings</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-12">
        {data.active_listings?.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
      <h2 className="text-xl font-semibold mb-4">Expired Listings</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {data.inactive_listings?.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </section>
  );
}

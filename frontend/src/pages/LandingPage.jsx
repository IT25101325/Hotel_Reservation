import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Users, 
  ShieldCheck, 
  Award, 
  ChevronRight, 
  MapPin
} from 'lucide-react';

const LandingPage = () => {
  const [allInventory, setAllInventory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [modalType, setModalType] = useState('space'); // 'space' or 'package'
  const navigate = useNavigate();

  // Integrated Booking Search Bar State
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const [searchCheckIn, setSearchCheckIn] = useState(tomorrow);
  const [searchCheckOut, setSearchCheckOut] = useState(dayAfterTomorrow);
  const [searchGuests, setSearchGuests] = useState('2');
  const [searchCategory, setSearchCategory] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueRes, pkgRes] = await Promise.all([
          api.get('/public/venues/all').catch(() => api.get('/public/venues')),
          api.get('/public/packages')
        ]);
        setAllInventory(Array.isArray(venueRes.data) ? venueRes.data : []);
        setPackages(Array.isArray(pkgRes.data) ? pkgRes.data : []);
      } catch (err) {
        console.warn('Backend inventory fallback applied:', err);
        setAllInventory([]);
        setPackages([]);
      }
    };
    fetchData();

    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    }
  }, []);

  // Filter into rooms and venues
  const rooms = allInventory.filter(item => item.type === 'ROOM');
  const venues = allInventory.filter(item => item.type !== 'ROOM');

  // Fallback high-res luxury rooms
  const displayRooms = rooms.length > 0 ? rooms : [
    {
      id: 3,
      name: "Executive Pinnacle Suite",
      type: "ROOM",
      category: "SUITE",
      capacity: 4,
      pricePerNight: 450.00,
      description: "Exclusive top-floor luxury suite offering panoramic ocean vistas, private jacuzzi, expansive master lounge, and personal 24-hour butler service.",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      facilities: "King Size Bed, Jacuzzi, Private Balcony, High-speed Wi-Fi, Mini Bar, Butler Service"
    },
    {
      id: 5,
      name: "Deluxe Ocean View Room",
      type: "ROOM",
      category: "DELUXE",
      capacity: 2,
      pricePerNight: 220.00,
      description: "Sun-drenched haven featuring floor-to-ceiling glass balconies overlooking the Indian Ocean, bespoke Egyptian cotton linens, and marble bathroom.",
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      facilities: "Queen Bed, Sea View Balcony, Work Desk, Smart TV, Air Conditioning, Rain Shower"
    }
  ];

  // Fallback high-res luxury venues
  const displayVenues = venues.length > 0 ? venues : [
    {
      id: 1,
      name: "The Grand Royal Ballroom",
      type: "BANQUET_HALL",
      capacity: 500,
      pricePerNight: 2500.00,
      location: "East Wing, Grand Lobby Level",
      description: "A breathtaking architectural marvel with soaring crystal chandeliers, LED video walls, acoustic sound engineering, and adjacent private banquet prep kitchen.",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      facilities: "Central AC, High-tech Audio/Visual, Stage, LED Screen, Catering Kitchen Access"
    },
    {
      id: 2,
      name: "Emerald Oceanfront Garden",
      type: "GARDEN_VENUE",
      capacity: 300,
      location: "Seaside Promenade Grounds",
      description: "Romantic tropical garden surrounded by swaying palms, manicured flora, and an illuminated seaside gazebo with sunset backdrop.",
      imageUrl: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
      facilities: "Outdoor Lighting, Gazebo, Beach Access, Portable Stage, Sunset View"
    },
    {
      id: 4,
      name: "Sapphire Conference Center",
      type: "CONFERENCE_HALL",
      capacity: 120,
      location: "Executive Tower, 3rd Floor",
      description: "High-tech executive amphitheater with smart 4K laser projection, hybrid international conferencing, and ergonomic leather delegate seating.",
      imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80",
      facilities: "Smart Projector, Hybrid Video Conferencing, Soundproof Walls, Ergonomic Chairs"
    }
  ];

  // Fallback event packages
  const displayPackages = packages.length > 0 ? packages : [
    {
      id: 1,
      name: "Royal Wedding Extravaganza",
      eventType: "WEDDING",
      price: 4500.00,
      discountPercentage: 10,
      maxCapacity: 350,
      description: "Our signature all-inclusive wedding experience. Complete luxury decor, 5-course gourmet banquet, floral styling, live sound, and a complimentary night in our bridal suite.",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      includedServices: [
        "5-Course Gourmet Buffet for up to 350 guests",
        "Designer Floral Stage & Aisle Decorations",
        "Professional DJ, Audio & Intelligent Lighting",
        "Complimentary Executive Bridal Suite Stay",
        "Custom 3-Tier Luxury Wedding Cake"
      ]
    },
    {
      id: 2,
      name: "Corporate Leadership Summit",
      eventType: "CONFERENCE",
      price: 2200.00,
      discountPercentage: 5,
      maxCapacity: 100,
      description: "Designed for international board retreats and executive conferences. Includes seamless audiovisuals, high-speed fiber internet, and all-day executive catering.",
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
      includedServices: [
        "High-Speed Gigabit Wi-Fi & 4K Laser Projection",
        "Executive Lunch Buffet in Private Dining Hall",
        "Continuous Artisan Coffee & Afternoon High Tea",
        "Stationery, Notepads & Delegate Welcome Kits"
      ]
    },
    {
      id: 3,
      name: "VIP Birthday Jubilee",
      eventType: "BIRTHDAY",
      price: 1500.00,
      discountPercentage: 0,
      maxCapacity: 80,
      description: "Celebrate milestones with flair. Dynamic lighting, personalized bar setup, gourmet finger food stations, and a 360-degree interactive photo booth.",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
      includedServices: [
        "Custom Themed Ambient Lighting & Backdrop",
        "Artisan Cocktail & Mocktail Bar Service",
        "360 Degree Interactive Photo Booth Experience",
        "Artisanal Custom Celebration Cake"
      ]
    }
  ];

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      startDate: searchCheckIn,
      endDate: searchCheckOut,
      guests: searchGuests,
      category: searchCategory
    }).toString();
    navigate(`/booking?${query}`);
  };

  const openSpaceModal = (item) => {
    setSelectedItemForModal(item);
    setModalType('space');
  };

  const openPackageModal = (pkg) => {
    setSelectedItemForModal(pkg);
    setModalType('package');
  };

  return (
    <div className="rosewood-page">
      {/* 1. Haute Luxury Editorial Hero Header (Matches Rosewood Aesthetic) */}
      <section style={{
        background: '#FAF8F5',
        padding: '5rem 1.5rem 3rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <img 
              src="/grand-luxe-emblem-dark.png" 
              alt="Grand Luxe Emblem" 
              style={{ height: '62px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>

          <div style={{
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#8B7B61',
            fontWeight: 700,
            marginBottom: '1.5rem'
          }}>
            HAUTE HOSPITALITY & PRIVATE CELEBRATIONS
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(3.5rem, 8vw, 6.2rem)',
            fontWeight: 400,
            letterSpacing: '-0.025em',
            lineHeight: 1.0,
            color: '#141414',
            marginBottom: '1.6rem'
          }}>
            Events
          </h1>

          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.2rem, 2.5vw, 1.55rem)',
            fontStyle: 'italic',
            color: '#383838',
            lineHeight: 1.6,
            maxWidth: '740px',
            margin: '0 auto 3.5rem auto',
            fontWeight: 400
          }}>
            Create unforgettable memories with luxurious events in the heart of Colombo’s vibrant oceanfront charm.
          </p>
        </div>

        {/* 3. Grand Classical Interior Architectural Photograph (Rosewood Showcase) */}
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          height: 'clamp(420px, 62vh, 720px)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.12)'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85" 
            alt="Grand Luxe Classical Hotel Salon & Events Hall"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%)'
          }} />

          {/* Floating Lower Captions */}
          <div style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '2.5rem',
            right: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1.25rem',
            color: '#ffffff'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '0.35rem' }}>
                The Grand Heritage Salon & Ballroom
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 500 }}>
                A Sanctuary of Timeless Distinction
              </div>
            </div>

            <Link 
              to="/booking" 
              className="rosewood-btn-green"
              style={{
                padding: '0.8rem 2.2rem',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}
            >
              Reserve An Event Space <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Streamlined Luxury Availability & Reservation Ribbon */}
      <section style={{ maxWidth: '1240px', margin: '-2.5rem auto 5rem auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8E2D8',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.06)',
          padding: '2rem 2.25rem'
        }}>
          <form onSubmit={handleHeroSearch} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 170px',
            gap: '1.5rem',
            alignItems: 'flex-end'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Check-in Date
              </label>
              <input 
                type="date" 
                className="rosewood-input"
                value={searchCheckIn} 
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Check-out Date
              </label>
              <input 
                type="date" 
                className="rosewood-input"
                value={searchCheckOut} 
                min={searchCheckIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setSearchCheckOut(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Guests / Attendees
              </label>
              <select 
                className="rosewood-input"
                value={searchGuests} 
                onChange={(e) => setSearchGuests(e.target.value)}
              >
                <option value="1">1 Guest (Executive Stay)</option>
                <option value="2">2 Guests (Couple / Pair)</option>
                <option value="4">4 Guests (VIP Delegation)</option>
                <option value="20">20 Guests (Executive Gathering)</option>
                <option value="50">50 Guests (Intimate Function)</option>
                <option value="100">100+ Guests (Grand Celebration)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '0.5rem' }}>
                Offering Type
              </label>
              <select 
                className="rosewood-input"
                value={searchCategory} 
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="ALL">All Accommodations & Venues</option>
                <option value="ROOM">Suites & Rooms Only</option>
                <option value="BANQUET_HALL">Banquet Ballrooms</option>
                <option value="GARDEN_VENUE">Oceanfront Gardens</option>
                <option value="CONFERENCE_HALL">Conference Halls</option>
              </select>
            </div>

            <div>
              <button 
                type="submit" 
                className="rosewood-btn-green"
                style={{ width: '100%', height: '44px' }}
              >
                Check Rates
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 5. Section: Extraordinary Special Events & Gatherings */}
      <section id="events" style={{ maxWidth: '1360px', margin: '0 auto 6.5rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#8B7B61', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.6rem' }}>
            CELEBRATIONS & SUMMITS
          </div>
          <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', color: '#1A1A1A', fontWeight: 400, marginBottom: '0.85rem' }}>
            Signature Event Curations
          </h2>
          <p style={{ color: '#555555', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
            Our dedicated coordinators pair world-class oceanfront spaces with bespoke gourmet dining, intelligent acoustic engineering, and white-glove hospitality.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem'
        }}>
          {[
            {
              title: "Weddings & Receptions",
              desc: "Grand processions beneath shimmering crystal chandeliers or romantic vows by the oceanfront garden at golden hour.",
              image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
              capacity: "50 - 500 Guests",
              type: "WEDDING"
            },
            {
              title: "Corporate Conferences",
              desc: "Distinguished leadership summits, shareholder banquets, and hybrid international forums equipped with gigabit fiber.",
              image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
              capacity: "20 - 200 Delegates",
              type: "CONFERENCE"
            },
            {
              title: "VIP Birthday Jubilees",
              desc: "Milestone birthdays and private anniversaries with custom lighting, bespoke craft cocktail bars, and live quartet sound.",
              image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
              capacity: "30 - 150 Guests",
              type: "BIRTHDAY"
            },
            {
              title: "Gala Dinners & Banquets",
              desc: "Sophisticated black-tie galas, diplomatic charity fundraisers, and award nights with multi-course silver service gastronomy.",
              image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
              capacity: "100 - 450 Guests",
              type: "BANQUET"
            }
          ].map((evt, idx) => (
            <div key={idx} className="rosewood-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '300px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={evt.image} 
                  alt={evt.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: '#FFFFFF',
                  color: '#1C1C1C',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  {evt.capacity}
                </span>
              </div>

              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.5rem', color: '#1A1A1A', marginBottom: '0.65rem', fontWeight: 500 }}>
                  {evt.title}
                </h3>
                <p style={{ color: '#555555', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '1.75rem', flexGrow: 1 }}>
                  {evt.desc}
                </p>
                <button 
                  onClick={() => navigate(`/booking?eventType=${evt.type}`)} 
                  className="rosewood-btn-outline"
                  style={{ width: '100%' }}
                >
                  Plan This Event <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Section: Sanctuary-Inspired Accommodations */}
      <section id="accommodations" style={{ background: '#F5F2EB', padding: '6rem 1.5rem', marginBottom: '6rem' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#8B7B61', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.6rem' }}>
              SANCTUARY RESIDENCES
            </div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', color: '#1A1A1A', fontWeight: 400, marginBottom: '0.85rem' }}>
              Suites & Oceanfront Living
            </h2>
            <p style={{ color: '#555555', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
              Retreat to residential-style suites finished with imported Italian marble, custom handcrafted timber, and floor-to-ceiling Indian Ocean panoramas.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2.5rem'
          }}>
            {displayRooms.map((room) => (
              <div key={room.id} className="rosewood-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={room.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"} 
                    alt={room.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#0B3B2C',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '0.35rem 0.75rem'
                  }}>
                    {room.category || 'RESIDENCE'}
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#1C1C1C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Users size={14} color="#8B7B61" /> Up to {room.capacity} Guests
                  </span>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#1A1A1A', marginBottom: '0.65rem', fontWeight: 500 }}>
                    {room.name}
                  </h3>
                  <p style={{ color: '#555555', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.65, flexGrow: 1 }}>
                    {room.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #E8E2D8',
                    paddingTop: '1.25rem',
                    marginTop: 'auto'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#7E7A73', textTransform: 'uppercase', display: 'block' }}>From</span>
                      <div style={{ fontSize: '1.55rem', fontWeight: 700, color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>
                        LKR {room.pricePerNight} <span style={{ fontSize: '0.85rem', color: '#7E7A73', fontWeight: 400 }}>/ night</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      <button 
                        onClick={() => openSpaceModal(room)} 
                        className="rosewood-btn-outline"
                        style={{ padding: '0.6rem 1.1rem', fontSize: '0.72rem' }}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => navigate(`/booking?venueId=${room.id}`)} 
                        className="rosewood-btn-green"
                        style={{ padding: '0.6rem 1.3rem', fontSize: '0.72rem' }}
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Section: Architectural Venues & Grand Spaces */}
      <section id="venues" style={{ maxWidth: '1360px', margin: '0 auto 6.5rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#8B7B61', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.6rem' }}>
            ICONIC SETTINGS
          </div>
          <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', color: '#1A1A1A', fontWeight: 400, marginBottom: '0.85rem' }}>
            Halls & Oceanfront Venues
          </h2>
          <p style={{ color: '#555555', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
            From grand ballroom crystal chandeliers to open-air coastal pavilions, our architectural venues provide a dignified canvas for unforgettable events.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem'
        }}>
          {displayVenues.map((venue) => (
            <div key={venue.id} className="rosewood-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '300px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={venue.imageUrl || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"} 
                  alt={venue.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#0B3B2C',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.35rem 0.75rem'
                }}>
                  {venue.type.replace('_', ' ')}
                </span>
                <span style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: '#FFFFFF',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#1C1C1C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <Users size={14} color="#8B7B61" /> Up to {venue.capacity} Guests
                </span>
              </div>

              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.6rem', color: '#1A1A1A', marginBottom: '0.65rem', fontWeight: 500 }}>
                  {venue.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#7E7A73', marginBottom: '1rem' }}>
                  <MapPin size={14} color="#8B7B61" /> {venue.location}
                </div>
                <p style={{ color: '#555555', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.65, flexGrow: 1 }}>
                  {venue.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #E8E2D8',
                  paddingTop: '1.25rem',
                  marginTop: 'auto'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#7E7A73', textTransform: 'uppercase', display: 'block' }}>Daily Hire</span>
                    <div style={{ fontSize: '1.55rem', fontWeight: 700, color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>
                      LKR {venue.pricePerNight}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button 
                      onClick={() => openSpaceModal(venue)} 
                      className="rosewood-btn-outline"
                      style={{ padding: '0.6rem 1.1rem', fontSize: '0.72rem' }}
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => navigate(`/booking?venueId=${venue.id}`)} 
                      className="rosewood-btn-green"
                      style={{ padding: '0.6rem 1.3rem', fontSize: '0.72rem' }}
                    >
                      Reserve Space
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Section: Curated All-Inclusive Event Packages */}
      <section id="packages" style={{ background: '#F5F2EB', padding: '6rem 1.5rem', marginBottom: '6rem' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#8B7B61', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.6rem' }}>
              TAILORED EXPERIENCES
            </div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', color: '#1A1A1A', fontWeight: 400, marginBottom: '0.85rem' }}>
              All-Inclusive Event Packages
            </h2>
            <p style={{ color: '#555555', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
              Expertly curated packages published by our professional event directors, complete with transparent pricing, banquet catering, and audiovisuals.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2.5rem'
          }}>
            {displayPackages.map((pkg) => (
              <div key={pkg.id} className="rosewood-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={pkg.imageUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"} 
                    alt={pkg.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#0B3B2C',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '0.35rem 0.75rem'
                  }}>
                    {pkg.eventType}
                  </span>
                  {pkg.discountPercentage > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: '#C5A059',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '0.35rem 0.75rem'
                    }}>
                      {pkg.discountPercentage}% Privilege
                    </span>
                  )}
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.5rem', color: '#1A1A1A', flexGrow: 1, fontWeight: 500 }}>
                      {pkg.name}
                    </h3>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>
                        LKR {pkg.price}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#7E7A73' }}>Inclusive Fee</span>
                    </div>
                  </div>

                  <p style={{ color: '#555555', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.65 }}>
                    {pkg.description}
                  </p>

                  <div style={{ marginBottom: '1.75rem', flexGrow: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                      Included Services:
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {pkg.includedServices && pkg.includedServices.slice(0, 4).map((service, idx) => (
                        <li key={idx} style={{ fontSize: '0.86rem', color: '#4A4A4A', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Check size={14} color="#0B3B2C" strokeWidth={2.5} />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', borderTop: '1px solid #E8E2D8', paddingTop: '1.25rem' }}>
                    <button 
                      onClick={() => openPackageModal(pkg)} 
                      className="rosewood-btn-outline" 
                      style={{ flex: 1, padding: '0.65rem' }}
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => navigate(`/booking?packageId=${pkg.id}`)} 
                      className="rosewood-btn-green"
                      style={{ flex: 1, padding: '0.65rem' }}
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Section: The Grand Luxe Distinction & Heritage */}
      <section id="heritage" style={{ maxWidth: '1240px', margin: '0 auto 7rem auto', padding: '0 1.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8E2D8',
          padding: '4rem 3rem',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.35rem' }}>
            <img 
              src="/grand-luxe-emblem-dark.png" 
              alt="Grand Luxe Heritage Emblem" 
              style={{ height: '52px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: '#8B7B61', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
            A LEGACY OF EXCELLENCE
          </div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', color: '#1A1A1A', fontWeight: 400, marginBottom: '1.5rem' }}>
            The Grand Luxe Distinction
          </h2>
          <p style={{ color: '#555555', maxWidth: '750px', margin: '0 auto 3.5rem auto', fontSize: '1.1rem', lineHeight: 1.75, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
            Steeped in coastal charm and classical architecture, Grand Luxe offers an enclave of privacy and prestige for discerning international guests and monumental occasions.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            textAlign: 'left'
          }}>
            <div style={{ borderTop: '2px solid #0B3B2C', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <ShieldCheck size={22} color="#0B3B2C" />
                <h4 style={{ fontSize: '1.25rem', color: '#1A1A1A', fontWeight: 600 }}>Guaranteed Single-Booking</h4>
              </div>
              <p style={{ color: '#666666', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Our proprietary real-time conflict prevention engine guarantees absolute exclusive access to your reserved hall or suite with zero double-booking possibility.
              </p>
            </div>

            <div style={{ borderTop: '2px solid #0B3B2C', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <Sparkles size={22} color="#0B3B2C" />
                <h4 style={{ fontSize: '1.25rem', color: '#1A1A1A', fontWeight: 600 }}>White-Glove Coordination</h4>
              </div>
              <p style={{ color: '#666666', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Every wedding, gala, and summit is assigned a certified resident event director overseeing catering, lighting, acoustics, and guest arrivals.
              </p>
            </div>

            <div style={{ borderTop: '2px solid #0B3B2C', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <Award size={22} color="#0B3B2C" />
                <h4 style={{ fontSize: '1.25rem', color: '#1A1A1A', fontWeight: 600 }}>Michelin-Grade Banqueting</h4>
              </div>
              <p style={{ color: '#666666', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Executive chefs craft bespoke five-course banquet menus, sommelier wine selections, and artisanal dessert artistry customized to your heritage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Grand Call to Action Banner (Signature Dark Emerald Rosewood Block) */}
      <section style={{
        background: '#0B3B2C',
        color: '#FFFFFF',
        padding: '5.5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <img 
              src="/grand-luxe-emblem-gold.png" 
              alt="Grand Luxe Gold Emblem" 
              style={{ height: '50px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>

          <div style={{ fontSize: '0.75rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5A059', fontWeight: 700, marginBottom: '1.25rem' }}>
            DISCOVER GRAND LUXE
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.6rem, 5vw, 4rem)',
            fontWeight: 400,
            lineHeight: 1.15,
            marginBottom: '1.5rem'
          }}>
            Host Your Next Celebration at Grand Luxe
          </h2>

          <p style={{
            fontSize: '1.15rem',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '2.5rem',
            lineHeight: 1.7,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic'
          }}>
            Whether reserving an oceanfront suite or curating a milestone gala, our concierge team awaits to deliver an unmatched celebration experience.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/booking" 
              style={{
                background: '#C5A059',
                color: '#1C1C1C',
                padding: '0.9rem 2.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#E5C158'}
              onMouseOut={(e) => e.currentTarget.style.background = '#C5A059'}
            >
              Reserve Your Stay <ArrowRight size={15} />
            </Link>

            <Link 
              to="/reservations" 
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                padding: '0.9rem 2.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.25s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = '#0B3B2C';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              View Reservations
            </Link>
          </div>
        </div>
      </section>

      {/* Details Modal */}
      {selectedItemForModal && (
        <Modal 
          isOpen={Boolean(selectedItemForModal)} 
          onClose={() => setSelectedItemForModal(null)} 
          title={selectedItemForModal.name}
        >
          <div>
            <div style={{ height: '300px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #E8E2D8' }}>
              <img 
                src={selectedItemForModal.imageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"} 
                alt={selectedItemForModal.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <p style={{ color: '#4A4A4A', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {selectedItemForModal.description}
            </p>

            {modalType === 'space' && selectedItemForModal.facilities && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.65rem' }}>
                  Features & Facilities:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedItemForModal.facilities.split(',').map((f, i) => (
                    <span key={i} style={{
                      background: '#F5F2EB',
                      color: '#1C1C1C',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.8rem',
                      border: '1px solid #E8E2D8'
                    }}>
                      {f.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {modalType === 'package' && selectedItemForModal.includedServices && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.65rem' }}>
                  Included Services:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedItemForModal.includedServices.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#3A3A3A' }}>
                      <Check size={14} color="#0B3B2C" strokeWidth={2.5} /> {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                const target = modalType === 'space' 
                  ? `/booking?venueId=${selectedItemForModal.id}` 
                  : `/booking?packageId=${selectedItemForModal.id}`;
                setSelectedItemForModal(null);
                navigate(target);
              }} 
              className="rosewood-btn-green" 
              style={{ width: '100%', padding: '0.85rem' }}
            >
              Reserve This Selection
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LandingPage;

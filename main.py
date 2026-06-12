import os
from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, Form, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid
import requests
import base64
import paypalrestsdk

load_dotenv()

app = FastAPI(title="UP IN THE L API", version="2.0.0")

origins = [
    "https://legendary-giggle-p7rj9wv56pp4f5gr-5173.app.github.dev",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://upinthel-demo-launch.vercel.app",   # your exact Vercel URL
        "https://*.vercel.app",                     # optional wildcard (allows preview deployments)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{path:path}")
async def preflight_handler():
    return {}

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# ---------- Pydantic Models ----------
class BookingRequest(BaseModel):
    booking_type: str
    item_id: str
    item_name: str
    total_amount: float
    guest_name: str
    guest_email: str
    user_id: Optional[str] = None
    artist_name: Optional[str] = None
    event_date: Optional[str] = None
    event_location: Optional[str] = None
    message: Optional[str] = None

class NominationRequest(BaseModel):
    nominator_name: str
    nominator_email: str
    nominee_name: str
    nominee_age: int
    nominee_field: str
    reason: str

class InterestedRequest(BaseModel):
    event_id: str
    user_id: str

class EventBookingRequest(BaseModel):
    event_id: str
    ticket_type: str
    quantity: int
    guest_name: str
    guest_email: str
    phone: Optional[str] = None

class CommentRequest(BaseModel):
    article_id: str
    user_id: Optional[str] = None
    guest_name: Optional[str] = None
    content: str

class LikeRequest(BaseModel):
    article_id: str
    user_id: str

class InternshipCreate(BaseModel):
    title: str
    company_name: str
    location: str
    district: Optional[str] = None
    duration: str
    stipend: Optional[float] = None
    application_deadline: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    contact_email: Optional[str] = None

class InternshipApplication(BaseModel):
    internship_id: str
    applicant_name: str
    applicant_email: str
    cover_letter: Optional[str] = None

class ContributorApplicationRequest(BaseModel):
    contributor_types: List[str]
    primary_type: str

class PayoutRequest(BaseModel):
    amount: float
    payment_method: str

class OrderItem(BaseModel):
    type: str
    id: str
    name: str
    price: float
    quantity: int
    contributor_id: Optional[str] = None

class OrderRequest(BaseModel):
    guest_name: str
    guest_email: str
    phone: Optional[str] = None
    items: List[OrderItem]
    total_amount: float

class AccommodationBooking(BaseModel):
    accommodation_id: str
    check_in: str
    check_out: str
    guests: int
    rooms: int
    payment_method: str
    guest_name: str
    guest_email: str
    phone: Optional[str] = None

class FollowRequest(BaseModel):
    artist_id: str

class FollowBrandRequest(BaseModel):
    brand_id: str

class FollowArtistRequest(BaseModel):
    artist_id: str

class EventBookingRequest(BaseModel):
    event_id: str
    quantity: int
    payment_method: str
    guest_name: str
    guest_email: str
    phone: Optional[str] = None

class AdImpressionRequest(BaseModel):
    ad_id: str
    was_skipped: bool = False
    duration_played: int = 0

# ---------- Root & Health ----------
@app.get("/")
def root():
    return {"message": "UP IN THE L API is running"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

# ---------- User ----------
security = HTTPBearer()
def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@app.get("/api/user/profile/{user_id}")
def get_user_profile(user_id: str):
    result = supabase.table("user_profiles").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]

# Optional user ID extractor (for guest users)
def get_current_user_id_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if credentials:
        try:
            user = supabase.auth.get_user(credentials.credentials)
            return user.user.id
        except Exception:
            pass
    return None

@app.put("/api/user/upgrade")
def upgrade_user(user_id: str, plan_type: str):
    amount = 22 if plan_type == "monthly" else 187
    end_date = datetime.now()
    if plan_type == "monthly":
        end_date = end_date.replace(month=end_date.month + 1)
    else:
        end_date = end_date.replace(year=end_date.year + 1)
    supabase.table("user_profiles").update({
        "subscription_tier": "premium",
        "subscription_end_date": end_date.isoformat()
    }).eq("id", user_id).execute()
    supabase.table("payments").insert({
        "user_id": user_id,
        "amount": amount,
        "plan_type": plan_type,
        "payment_method": "simulated",
        "status": "completed"
    }).execute()
    return {"message": "Upgrade successful"}

# ---------- Home ----------
@app.get("/api/trending")
def get_trending():
    return [
        {"category": "🎵 Music", "title": "Tsepo Tshola Tribute Concert – This Saturday at Maseru Stadium", "link": "#"},
        {"category": "⚽ Sports", "title": "Likuena vs. Bafana Bafana: Tickets now on sale", "link": "#"},
        {"category": "💼 Business", "title": "Sekhametsi Consortium announces new youth investment fund", "link": "#"},
        {"category": "🎨 Art", "title": "Morija Arts & Cultural Festival – Call for artists", "link": "#"},
    ]

@app.get("/api/top35")
def get_top35():
    result = supabase.table("top35").select("*").execute()
    return result.data

@app.get("/api/ads")
def get_active_ads():
    result = supabase.table("ads").select("*").eq("is_active", True).order("display_order").execute()
    return result.data

# ---------- Culture ----------
@app.get("/api/art")
def get_art(limit: int = 30, offset: int = 0, search: str = "", user_id: Optional[str] = None):
    query = supabase.table("art").select("*, visual_artists(name)")
    if search:
        query = query.ilike("title", f"%{search}%")
    result = query.range(offset, offset+limit-1).execute()
    data = result.data
    if user_id:
        # Get user's liked art IDs
        likes = supabase.table("art_likes").select("art_id").eq("user_id", user_id).execute()
        liked_ids = {item["art_id"] for item in likes.data}
        for item in data:
            item["user_liked"] = item["id"] in liked_ids
    else:
        for item in data:
            item["user_liked"] = False
    return data

@app.post("/api/art/like")
def like_art(req: dict):
    user_id = req["user_id"]
    art_id = req["art_id"]
    
    existing = supabase.table("art_likes").select("*").eq("art_id", art_id).eq("user_id", user_id).execute()
    if existing.data:
        raise HTTPException(400, "You have already liked this artwork")
    
    supabase.table("art_likes").insert({"art_id": art_id, "user_id": user_id}).execute()
    supabase.table("art").update({"likes_count": supabase.raw("likes_count + 1")}).eq("id", art_id).execute()
    
    return {"liked": True}

@app.get("/api/visual-artists")
def get_visual_artists(limit: int = 20, offset: int = 0):
    result = supabase.table("visual_artists").select("*").order("name").range(offset, offset+limit-1).execute()
    return result.data

@app.get("/api/visual-artists/{artist_id}/artworks")
def get_artist_artworks(artist_id: str):
    result = supabase.table("art").select("*").eq("visual_artist_id", artist_id).order("created_at", desc=True).execute()
    return result.data

@app.get("/api/fashion")
def get_fashion(limit: int = 30, offset: int = 0, search: str = ""):
    query = supabase.table("clothing_items").select("*, fashion_brands(name)")
    if search:
        query = query.ilike("name", f"%{search}%")
    result = query.range(offset, offset+limit-1).execute()
    return result.data

@app.get("/api/fashion/brands")
def get_all_brands(limit: int = 20, offset: int = 0):
    result = supabase.table("fashion_brands").select("*").order("name").range(offset, offset+limit-1).execute()
    return result.data

@app.get("/api/fashion/brands/{brand_id}/items")
def get_brand_items(brand_id: str):
    result = supabase.table("clothing_items").select("*").eq("brand_id", brand_id).eq("is_active", True).execute()
    return result.data

@app.get("/api/fashion/brands/{brand_id}/gallery")
def get_brand_gallery(brand_id: str):
    result = supabase.table("fashion_brand_gallery").select("*").eq("brand_id", brand_id).order("display_order").execute()
    return result.data

@app.post("/api/fashion/like")
def like_fashion(req: dict):
    user_id = req["user_id"]
    clothing_id = req["clothing_id"]
    existing = supabase.table("clothing_likes").select("*").eq("clothing_id", clothing_id).eq("user_id", user_id).execute()
    if existing.data:
        supabase.table("clothing_likes").delete().eq("clothing_id", clothing_id).eq("user_id", user_id).execute()
        supabase.table("clothing_items").update({"likes_count": supabase.raw("likes_count - 1")}).eq("id", clothing_id).execute()
        return {"liked": False}
    else:
        supabase.table("clothing_likes").insert({"clothing_id": clothing_id, "user_id": user_id}).execute()
        supabase.table("clothing_items").update({"likes_count": supabase.raw("likes_count + 1")}).eq("id", clothing_id).execute()
        return {"liked": True}

# Artists (music)
@app.get("/api/artists")
def get_artists():
    result = supabase.table("artists").select("*").order("name").execute()
    return result.data

@app.get("/api/artists/{artist_id}/songs")
def get_artist_songs(artist_id: str):
    result = supabase.table("music").select("id, title, stream_count, audio_url").eq("artist_id", artist_id).execute()
    return result.data

@app.get("/api/artists/by-district/{district}")
def get_artists_by_district(district: str):
    result = supabase.table("artists").select("*").eq("district", district).execute()
    return result.data

# Follows (artists)
@app.post("/api/follows")
def follow_artist(req: FollowArtistRequest, user_id: str = Depends(get_current_user_id)):
    existing = supabase.table("follows").select("*").eq("user_id", user_id).eq("artist_id", req.artist_id).execute()
    if existing.data:
        raise HTTPException(400, "Already followed")
    supabase.table("follows").insert({"user_id": user_id, "artist_id": req.artist_id}).execute()
    return {"message": "Followed"}

@app.delete("/api/follows")
def unfollow_artist(artist_id: str, user_id: str = Depends(get_current_user_id)):
    supabase.table("follows").delete().eq("user_id", user_id).eq("artist_id", artist_id).execute()
    return {"message": "Unfollowed"}

@app.get("/api/follows")
def get_followed_artists(user_id: str = Depends(get_current_user_id)):
    result = supabase.table("follows").select("artist_id, artists(*)").eq("user_id", user_id).execute()
    return result.data

# Follows (brands)
@app.post("/api/follows/brands")
def follow_brand(req: FollowBrandRequest, user_id: str = Depends(get_current_user_id)):
    existing = supabase.table("follows_brands").select("*").eq("user_id", user_id).eq("brand_id", req.brand_id).execute()
    if existing.data:
        raise HTTPException(400, "Already followed")
    supabase.table("follows_brands").insert({"user_id": user_id, "brand_id": req.brand_id}).execute()
    return {"message": "Followed"}

@app.delete("/api/follows/brands")
def unfollow_brand(brand_id: str, user_id: str = Depends(get_current_user_id)):
    supabase.table("follows_brands").delete().eq("user_id", user_id).eq("brand_id", brand_id).execute()
    return {"message": "Unfollowed"}

@app.get("/api/follows/brands")
def get_followed_brands(user_id: str = Depends(get_current_user_id)):
    result = supabase.table("follows_brands").select("brand_id, fashion_brands(*)").eq("user_id", user_id).execute()
    return result.data

@app.get("/api/brands/discover")
def discover_brands():
    result = supabase.table("fashion_brands").select("*").order("created_at", desc=True).limit(12).execute()
    return result.data

@app.get("/api/music/top30")
def get_top30_songs():
    result = supabase.table("music").select("id, title, artist_id, stream_count, audio_url, artists(name)").order("stream_count", desc=True).limit(30).execute()
    return result.data

@app.post("/api/music/stream")
def log_stream(song_id: str, user_id: Optional[str] = None):
    supabase.table("streams").insert({"song_id": song_id, "user_id": user_id}).execute()
    return {"message": "Stream logged"}

# ---------- Explore ----------
@app.get("/api/explore/accommodations")
def get_accommodations():
    # Hardcoded for demo; replace with Supabase table later
    return [
        {"id": "acc1", "name": "Avani Lesotho", "type": "Hotel", "location": "Maseru", "price_per_night": 1200, "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", "description": "Luxury hotel.", "amenities": ["Pool", "Spa"]},
        {"id": "acc2", "name": "The Maseru Sun", "type": "Hotel", "location": "Maseru", "price_per_night": 950, "image": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400", "description": "Casino hotel.", "amenities": ["Casino", "Bar"]},
        {"id": "acc3", "name": "Blue Mountain Inn", "type": "Lodge", "location": "Teyateyaneng", "price_per_night": 750, "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400", "description": "Cosy lodge.", "amenities": ["Fireplace", "Garden"]},
    ]

@app.get("/api/explore/restaurants")
def get_restaurants():
    return [
        {"id": "res1", "name": "Piri Piri", "cuisine": "Portuguese", "location": "Maseru", "avg_price": 350, "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"},
        {"id": "res2", "name": "Nello's Pizza", "cuisine": "Italian", "location": "Maseru", "avg_price": 250, "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"},
        {"id": "res3", "name": "The Courtyard", "cuisine": "International", "location": "Maseru", "avg_price": 400, "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400"},
    ]

@app.get("/api/explore/attractions")
def get_attractions():
    return [
        {"id": "att1", "name": "Maletsunyane Falls", "duration": "Full day", "price": 800, "image": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400"},
        {"id": "att2", "name": "Sani Pass 4x4", "duration": "Half day", "price": 1200, "image": "https://images.unsplash.com/photo-1547141648-2c0a2a1c5e3e?w=400"},
        {"id": "att3", "name": "Thaba-Bosiu", "duration": "2-3 hours", "price": 450, "image": "https://images.unsplash.com/photo-1587574293340-e0011c4e9ecf?w=400"},
    ]

@app.get("/api/explore/districts")
def get_districts():
    try:
        result = supabase.table("districts").select("*").execute()
        return result.data
    except Exception as e:
        print(f"Error fetching districts: {e}")
        return []

@app.get("/api/explore/{district}/accommodations")
def get_accommodations_by_district(district: str):
    try:
        result = supabase.table("accommodations").select("*").eq("district", district).execute()
        return result.data
    except Exception as e:
        print(f"Error fetching accommodations for {district}: {e}")
        return []

@app.get("/api/explore/{district}/attractions")
def get_attractions_by_district(district: str):
    try:
        result = supabase.table("attractions").select("*").eq("district", district).execute()
        return result.data
    except Exception as e:
        print(f"Error fetching attractions for {district}: {e}")
        return []

@app.get("/api/explore/{district}/packages")
def get_packages_by_district(district: str):
    try:
        result = supabase.table("tourism_packages").select("*").eq("district", district).execute()
        return result.data
    except Exception as e:
        print(f"Error fetching packages for {district}: {e}")
        return []

# ---------- Accommodation Booking ----------
@app.post("/api/explore/accommodations/book")
def book_accommodation(booking: AccommodationBooking):
    acc = supabase.table("accommodations").select("rooms_available, price_per_night, name").eq("id", booking.accommodation_id).execute()
    if not acc.data:
        raise HTTPException(404, "Accommodation not found")
    if acc.data[0]["rooms_available"] < booking.rooms:
        raise HTTPException(400, "Not enough rooms available")
    nights = (datetime.fromisoformat(booking.check_out) - datetime.fromisoformat(booking.check_in)).days
    total = nights * booking.rooms * acc.data[0]["price_per_night"]
    supabase.table("accommodations").update({"rooms_available": acc.data[0]["rooms_available"] - booking.rooms}).eq("id", booking.accommodation_id).execute()
    supabase.table("bookings").insert({
        "booking_type": "accommodation",
        "item_id": booking.accommodation_id,
        "item_name": acc.data[0]["name"],
        "total_amount": total,
        "guest_name": booking.guest_name,
        "guest_email": booking.guest_email,
        "phone": booking.phone,
        "payment_method": booking.payment_method,
        "status": "confirmed"
    }).execute()
    return {"message": "Booking confirmed", "total": total}

# ---------- Bookings (general) ----------
@app.post("/api/bookings")
def create_booking(booking: BookingRequest):
    if booking.booking_type in ["accommodation", "dining", "attraction"]:
        if not booking.guest_name or not booking.guest_email:
            raise HTTPException(status_code=400, detail="Guest name and email required")
    result = supabase.table("bookings").insert(booking.dict()).execute()
    return {"message": "Booking confirmed", "id": result.data[0]["id"] if result.data else None}

# ---------- Nominations ----------
@app.post("/api/nominations")
def submit_nomination(nom: NominationRequest):
    supabase.table("nominations").insert(nom.dict()).execute()
    supabase.table("admin_notifications").insert({
        "message": f"New nomination: {nom.nominee_name}",
        "link": "/admin/nominations"
    }).execute()
    return {"message": "Nomination submitted"}

# ---------- Events ----------
@app.get("/api/events")
def get_events(upcoming: Optional[bool] = True, limit: int = 12, offset: int = 0):
    query = supabase.table("events").select("*")
    now = datetime.now().isoformat()
    if upcoming:
        query = query.gte("event_date", now)
    else:
        query = query.lt("event_date", now)
    result = query.order("event_date", desc=False).range(offset, offset+limit-1).execute()
    events = result.data
    for e in events:
        e["is_past"] = e["event_date"] < now
    return events

@app.post("/api/events/interested")
def toggle_interested(req: InterestedRequest):
    existing = supabase.table("event_interested").select("*").eq("event_id", req.event_id).eq("user_id", req.user_id).execute()
    if existing.data:
        supabase.table("event_interested").delete().eq("event_id", req.event_id).eq("user_id", req.user_id).execute()
        # Get current count
        event = supabase.table("events").select("interested_count").eq("id", req.event_id).execute()
        current = event.data[0]["interested_count"]
        supabase.table("events").update({"interested_count": current - 1}).eq("id", req.event_id).execute()
        return {"interested": False}
    else:
        supabase.table("event_interested").insert({"event_id": req.event_id, "user_id": req.user_id}).execute()
        event = supabase.table("events").select("interested_count").eq("id", req.event_id).execute()
        current = event.data[0]["interested_count"]
        supabase.table("events").update({"interested_count": current + 1}).eq("id", req.event_id).execute()
        return {"interested": True}

@app.get("/api/events/organizers")
def get_organizers():
    result = supabase.table("event_organizers").select("*").execute()
    return result.data

@app.post("/api/events/organizers/follow")
def follow_organizer(req: dict, user_id: str = Depends(get_current_user_id)):
    existing = supabase.table("organizer_follows").select("*").eq("user_id", user_id).eq("organizer_id", req["organizer_id"]).execute()
    if existing.data:
        supabase.table("organizer_follows").delete().eq("user_id", user_id).eq("organizer_id", req["organizer_id"]).execute()
        return {"followed": False}
    else:
        supabase.table("organizer_follows").insert({"user_id": user_id, "organizer_id": req["organizer_id"]}).execute()
        return {"followed": True}

@app.get("/api/events/organizers/{organizer_id}/events")
def get_organizer_events(organizer_id: str):
    result = supabase.table("events").select("*").eq("organizer_id", organizer_id).order("event_date", desc=False).execute()
    return result.data

@app.post("/api/events/book")
def book_event(req: EventBookingRequest):
    event = supabase.table("events").select("tickets_available, name, price, accepted_payment_methods").eq("id", req.event_id).execute()
    if not event.data:
        raise HTTPException(404, "Event not found")
    if event.data[0]["tickets_available"] < req.quantity:
        raise HTTPException(400, "Not enough tickets")
    # Check if payment method is accepted
    accepted = event.data[0].get("accepted_payment_methods", [])
    if accepted and req.payment_method not in accepted:
        raise HTTPException(400, f"Payment method {req.payment_method} not accepted for this event")
    total = req.quantity * event.data[0]["price"]
    supabase.table("events").update({"tickets_available": event.data[0]["tickets_available"] - req.quantity}).eq("id", req.event_id).execute()
    supabase.table("bookings").insert({
        "booking_type": "event",
        "item_id": req.event_id,
        "item_name": event.data[0]["name"],
        "total_amount": total,
        "guest_name": req.guest_name,
        "guest_email": req.guest_email,
        "phone": req.phone,
        "payment_method": req.payment_method,
        "status": "confirmed"
    }).execute()
    return {"message": "Booking confirmed", "total": total}

# ---------- Orders & Earnings ----------
@app.post("/api/orders")
def create_order(order: OrderRequest, user_id: Optional[str] = None):
    order_data = order.dict()
    order_data["user_id"] = user_id
    order_data["status"] = "pending"
    result = supabase.table("orders").insert(order_data).execute()
    order_id = result.data[0]["id"]
    
    for item in order.items:
        if item.type == "art":
            commission_rate = 15.0
        else:
            commission_rate = 10.0
        platform_commission = item.price * item.quantity * (commission_rate / 100)
        net_earning = (item.price * item.quantity) - platform_commission
        available_from = datetime.now() + timedelta(days=7)
        supabase.table("earnings").insert({
            "user_id": item.contributor_id,
            "amount": item.price * item.quantity,
            "platform_commission": platform_commission,
            "net_earning": net_earning,
            "source_type": "order",
            "source_id": item.id,
            "order_id": order_id,
            "commission_rate": commission_rate,
            "is_available": False,
            "available_from": available_from.isoformat()
        }).execute()
    return {"id": order_id, "message": "Order created"}

# ---------- News ----------
@app.get("/api/news")
def get_news(category: Optional[str] = None, limit: int = 12, offset: int = 0):
    query = supabase.table("news_articles").select("*").eq("is_published", True)
    if category:
        query = query.eq("category", category)
    query = query.order("published_at", desc=True).range(offset, offset+limit-1)
    result = query.execute()
    return result.data

@app.get("/api/news/{slug}")
def get_article(slug: str):
    article = supabase.table("news_articles").select("*").eq("slug", slug).eq("is_published", True).execute()
    if not article.data:
        raise HTTPException(404, "Article not found")
    supabase.table("news_articles").update({"view_count": supabase.raw("view_count + 1")}).eq("slug", slug).execute()
    return article.data[0]

@app.post("/api/news/comments")
def add_comment(comment: CommentRequest):
    data = comment.dict()
    supabase.table("news_comments").insert(data).execute()
    supabase.table("news_articles").update({"comment_count": supabase.raw("comment_count + 1")}).eq("id", comment.article_id).execute()
    return {"message": "Comment added"}

@app.get("/api/news/comments")
def get_comments(article_id: str):
    result = supabase.table("news_comments").select("*").eq("article_id", article_id).order("created_at", desc=True).execute()
    return result.data

@app.post("/api/news/like")
def toggle_like(req: LikeRequest):
    existing = supabase.table("news_likes").select("*").eq("article_id", req.article_id).eq("user_id", req.user_id).execute()
    if existing.data:
        supabase.table("news_likes").delete().eq("article_id", req.article_id).eq("user_id", req.user_id).execute()
        supabase.table("news_articles").update({"like_count": supabase.raw("like_count - 1")}).eq("id", req.article_id).execute()
        return {"liked": False}
    else:
        supabase.table("news_likes").insert({"article_id": req.article_id, "user_id": req.user_id}).execute()
        supabase.table("news_articles").update({"like_count": supabase.raw("like_count + 1")}).eq("id", req.article_id).execute()
        return {"liked": True}

# ---------- Business ----------
@app.get("/api/businesses")
def get_businesses(category: Optional[str] = None, district: Optional[str] = None, limit: int = 12, offset: int = 0):
    query = supabase.table("businesses").select("*").eq("is_active", True)
    if category:
        query = query.eq("category", category)
    if district:
        query = query.eq("district", district)
    query = query.order("is_premium", desc=True).range(offset, offset+limit-1).execute()
    return query.data

@app.get("/api/jobs")
def get_jobs(limit: int = 12, offset: int = 0):
    result = supabase.table("job_postings").select("*").eq("is_active", True).order("created_at", desc=True).range(offset, offset+limit-1).execute()
    return result.data

@app.get("/api/tenders")
def get_tenders(limit: int = 12, offset: int = 0):
    result = supabase.table("tenders").select("*").eq("is_active", True).order("deadline", desc=False).range(offset, offset+limit-1).execute()
    return result.data

@app.get("/api/resources")
def get_resources():
    result = supabase.table("business_resources").select("*").execute()
    return result.data

@app.get("/api/spotlights")
def get_spotlights():
    result = supabase.table("business_spotlights").select("*").eq("is_active", True).order("spotlight_date", desc=True).limit(3).execute()
    return result.data

# ---------- Internships ----------
@app.get("/api/internships")
def get_internships(district: Optional[str] = None, limit: int = 12, offset: int = 0):
    query = supabase.table("internships").select("*").eq("is_active", True)
    if district:
        query = query.eq("district", district)
    query = query.range(offset, offset+limit-1).execute()
    return query.data

@app.post("/api/internships")
def create_internship(internship: InternshipCreate, user_id: str = Depends(get_current_user_id)):
    data = internship.dict()
    data["posted_by"] = user_id
    result = supabase.table("internships").insert(data).execute()
    return result.data[0]

@app.post("/api/internships/apply")
def apply_internship(application: InternshipApplication):
    supabase.table("internship_applications").insert(application.dict()).execute()
    return {"message": "Application submitted"}

# ---------- Architecture ----------
@app.get("/api/architects")
def get_architects(limit: int = 12, offset: int = 0):
    result = supabase.table("architects").select("*").range(offset, offset+limit-1).execute()
    return result.data

@app.get("/api/architects/{architect_id}")
def get_architect(architect_id: str):
    result = supabase.table("architects").select("*").eq("id", architect_id).execute()
    if not result.data:
        raise HTTPException(404, "Architect not found")
    return result.data[0]

@app.get("/api/architects/{architect_id}/projects")
def get_architect_projects(architect_id: str):
    result = supabase.table("architecture_projects").select("*").eq("architect_id", architect_id).execute()
    return result.data

# ---------- Contributor ----------
@app.post("/api/contributor/apply")
def apply_as_contributor(req: ContributorApplicationRequest, user_id: str = Depends(get_current_user_id)):
    existing = supabase.table("contributor_applications").select("*").eq("user_id", user_id).eq("status", "pending").execute()
    if existing.data:
        raise HTTPException(400, "You already have a pending application")
    supabase.table("contributor_applications").insert({
        "user_id": user_id,
        "contributor_types": req.contributor_types,
        "primary_type": req.primary_type,
        "status": "pending"
    }).execute()
    return {"message": "Application submitted"}

@app.post("/api/contributor/upload-document")
async def upload_verification_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    allowed = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed:
        raise HTTPException(400, "Only JPEG, PNG, or PDF allowed")
    ext = file.filename.split('.')[-1]
    file_name = f"{uuid.uuid4()}.{ext}"
    file_path = f"{user_id}/{file_name}"
    content = await file.read()
    res = supabase.storage.from_("verification-docs").upload(file_path, content)
    if hasattr(res, 'error') and res.error:
        raise HTTPException(500, "Upload failed")
    supabase.table("verification_documents").insert({
        "user_id": user_id,
        "document_type": document_type,
        "file_url": file_path,
        "status": "pending"
    }).execute()
    return {"message": "Document uploaded"}

@app.get("/api/contributor/stats")
def get_contributor_stats(user_id: str = Depends(get_current_user_id)):
    profile = supabase.table("user_profiles").select("available_balance").eq("id", user_id).execute()
    balance = profile.data[0]["available_balance"] if profile.data else 0
    return {"available_balance": balance, "total_sales": 0, "pending_payouts": 0}

@app.get("/api/contributor/earnings")
def get_earnings(user_id: str = Depends(get_current_user_id), limit: int = 50):
    result = supabase.table("earnings").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
    return result.data

@app.post("/api/contributor/verify-music")
def verify_music_artist(method: str, user_id: str = Depends(get_current_user_id)):
    profile = supabase.table("user_profiles").select("follower_count, is_music_verified").eq("id", user_id).execute()
    if not profile.data:
        raise HTTPException(404, "User not found")
    if profile.data[0]["is_music_verified"]:
        return {"message": "Already verified"}
    if method == "followers":
        if profile.data[0]["follower_count"] >= 5000:
            supabase.table("user_profiles").update({"is_music_verified": True}).eq("id", user_id).execute()
            return {"message": "Verified (followers)"}
        else:
            raise HTTPException(400, "Insufficient followers")
    elif method == "fee":
        supabase.table("user_profiles").update({"is_music_verified": True}).eq("id", user_id).execute()
        supabase.table("payments").insert({
            "user_id": user_id,
            "amount": 170,
            "plan_type": "music_verification",
            "status": "completed",
            "payment_method": "simulated"
        }).execute()
        return {"message": "Verified (fee paid)"}
    else:
        raise HTTPException(400, "Invalid method")

@app.post("/api/contributor/request-payout")
def request_payout(req: PayoutRequest, user_id: str = Depends(get_current_user_id)):
    profile = supabase.table("user_profiles").select("available_balance, payout_details").eq("id", user_id).execute()
    if not profile.data:
        raise HTTPException(404, "User not found")
    balance = profile.data[0]["available_balance"]
    if balance < req.amount:
        raise HTTPException(400, "Insufficient balance")
    if req.amount < 1000:
        raise HTTPException(400, "Minimum payout is M1000")
    supabase.table("payouts").insert({
        "user_id": user_id,
        "amount": req.amount,
        "payment_method": req.payment_method,
        "account_details": profile.data[0].get("payout_details"),
        "status": "pending"
    }).execute()
    return {"message": "Payout requested"}

# ---------- Admin ----------
@app.get("/api/admin/stats")
def get_admin_stats():
    return {
        "daily_arrivals": [120, 135, 148, 162, 189, 210],
        "avg_stay": [1.5, 1.6, 1.7, 1.8, 1.9, 2.0],
        "top_packages": [
            {"name": "Lesotho Highlands Explorer", "bookings": 342},
            {"name": "Sani Pass & Cultural Village", "bookings": 287},
            {"name": "Maseru City & Craft Tour", "bookings": 156}
        ],
        "rsa_visitors_percent": 32
    }

@app.get("/api/admin/contributor-applications")
def list_applications(admin_id: str = Depends(get_current_user_id)):
    apps = supabase.table("contributor_applications").select("*").eq("status", "pending").execute()
    return apps.data

@app.post("/api/admin/contributor-applications/{app_id}/approve")
def approve_application(app_id: str, admin_id: str = Depends(get_current_user_id)):
    app = supabase.table("contributor_applications").select("*").eq("id", app_id).execute()
    if not app.data:
        raise HTTPException(404, "Application not found")
    user_id = app.data[0]["user_id"]
    types = app.data[0]["contributor_types"]
    supabase.table("user_profiles").update({"contributor_types": types}).eq("id", user_id).execute()
    supabase.table("contributor_applications").update({
        "status": "approved",
        "reviewed_by": admin_id,
        "reviewed_at": datetime.now().isoformat()
    }).eq("id", app_id).execute()
    return {"message": "Approved"}

@app.post("/api/admin/contributor-applications/{app_id}/reject")
def reject_application(app_id: str, admin_id: str = Depends(get_current_user_id)):
    supabase.table("contributor_applications").update({
        "status": "rejected",
        "reviewed_by": admin_id,
        "reviewed_at": datetime.now().isoformat()
    }).eq("id", app_id).execute()
    return {"message": "Rejected"}

@app.post("/api/admin/release-earnings")
def release_earnings(admin_id: str = Depends(get_current_user_id)):
    now = datetime.now().isoformat()
    supabase.table("earnings").update({"is_available": True}).lt("available_from", now).eq("is_available", False).execute()
    earnings = supabase.table("earnings").select("user_id, net_earning").eq("is_available", True).execute()
    balances = {}
    for e in earnings.data:
        balances[e["user_id"]] = balances.get(e["user_id"], 0) + e["net_earning"]
    for uid, amount in balances.items():
        supabase.rpc("increment_user_balance", {"user_id": uid, "amount": amount}).execute()
    return {"message": f"Released earnings for {len(balances)} users"}

@app.get("/api/admin/verification-documents")
def get_pending_docs(admin_id: str = Depends(get_current_user_id)):
    docs = supabase.table("verification_documents").select("*").eq("status", "pending").execute()
    for doc in docs.data:
        signed = supabase.storage.from_("verification-docs").create_signed_url(doc["file_url"], 3600)
        doc["signed_url"] = signed
    return docs.data

@app.get("/api/admin/notifications")
def get_admin_notifications(admin_id: str = Depends(get_current_user_id)):
    result = supabase.table("admin_notifications").select("*").order("created_at", desc=True).execute()
    return result.data

@app.post("/api/admin/notifications/{id}/read")
def mark_notification_read(id: str, admin_id: str = Depends(get_current_user_id)):
    supabase.table("admin_notifications").update({"is_read": True}).eq("id", id).execute()
    return {"message": "Marked read"}

# --------ads--------
@app.get("/api/ads/next")
def get_next_ad():
    # Fetch the active ad with the highest priority
    ad = supabase.table("ad_campaigns").select("audio_file_url").eq("status", "active").limit(1).execute()
    if ad.data:
        return {"ad_url": ad.data[0]["audio_file_url"]}
    return {"ad_url": None}

# ---------- Signed URL for song (expires after song duration + 30s) ----------
@app.get("/api/music/signed-url/{song_id}")
def get_signed_song_url(song_id: str):
    result = supabase.table("music").select("storage_path, audio_url, duration_seconds").eq("id", song_id).execute()
    if not result.data:
        raise HTTPException(404, "Song not found")
    song = result.data[0]
    storage_path = song.get("storage_path")
    if storage_path:
        duration = song.get("duration_seconds", 180)
        expires_in = duration + 30
        signed_url = supabase.storage.from_("music-audio").create_signed_url(storage_path, expires_in)
        return {"signed_url": signed_url}
    else:
        # Fallback to public URL (temporary)
        return {"signed_url": song["audio_url"]}

# ---------- Weighted random ad selection ----------
@app.get("/api/ads/next")
def get_next_ad():
    campaigns = supabase.table("ad_campaigns").select("*").eq("is_active", True).execute()
    if not campaigns.data:
        return {"ad_url": None, "ad_id": None}
    
    total_priority = sum(c["priority"] for c in campaigns.data)
    if total_priority == 0:
        selected = random.choice(campaigns.data)
    else:
        r = random.randint(1, total_priority)
        cum = 0
        selected = None
        for c in campaigns.data:
            cum += c["priority"]
            if r <= cum:
                selected = c
                break
    return {"ad_url": selected["audio_url"], "ad_id": selected["id"]}

# ---------- Track ad impression (start, skip, completion) ----------
@app.post("/api/ads/impression")
def track_ad_impression(req: AdImpressionRequest, user_id: Optional[str] = Depends(get_current_user_id_optional)):
    supabase.table("ad_impressions").insert({
        "ad_id": req.ad_id,
        "user_id": user_id,
        "was_skipped": req.was_skipped,
        "duration_played": req.duration_played
    }).execute()
    return {"message": "tracked"}

# ---------- Admin: get ad campaign stats ----------
@app.get("/api/admin/ad-stats")
def get_ad_stats(admin_id: str = Depends(get_current_user_id)):
    # You should verify admin role (e.g., is_admin flag in user_profiles)
    campaigns = supabase.table("ad_campaigns").select("*").execute()
    result = []
    for camp in campaigns.data:
        impressions = supabase.table("ad_impressions").select("id").eq("ad_id", camp["id"]).execute()
        count = len(impressions.data)
        revenue = (count / 1000) * camp["cpm"]
        result.append({
            "id": camp["id"],
            "advertiser": camp["advertiser_name"],
            "cpm": camp["cpm"],
            "impressions": count,
            "revenue": round(revenue, 2)
        })
    return result

# ---------- Search ----------
@app.get("/api/search")
def search_all(q: str, limit: int = 20):
    if not q:
        return []
    search_term = f"%{q}%"
    results = []
    # ... (keep your existing search implementation) ...
    return results
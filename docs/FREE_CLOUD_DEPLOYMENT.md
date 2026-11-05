# 🚀 ફ્રી લાઈવ ડિપ્લોયમેન્ટ ગાઈડ (Vercel + Free Cloud PostgreSQL + Render)
# Free Live Cloud Deployment Guide

આ ગાઈડ મુજબ તમે તમારા આખા **Global Stock Market Platform** ને **100% ફ્રીમાં (No Credit Card Required)** લાઈવ કરી શકો છો.

---

## 1. 🆓 100% ફ્રી ક્લાઉડ PostgreSQL ડેટાબેઝ સેટઅપ (Neon.tech)

તમારી લોકલ મશીન સિવાય ઈન્ટરનેટ પર લાઈવ ડેટાબેઝ માટે [Neon Serverless PostgreSQL](https://neon.tech) સૌથી બેસ્ટ અને કાયમી ફ્રી (Free Tier) છે:

### સ્ટેપ્સ:
1. **https://neon.tech** પર જાઓ અને ફ્રી સાઈન અપ કરો (GitHub અથવા Google એકાઉન્ટથી).
2. **Create Project** પર ક્લિક કરો:
   - Project Name: `stock-market`
   - Region: `Asia Pacific (Singapore)` અથવા `US East`
3. પ્રોજેક્ટ બનતા જ સ્ક્રીન પર તમને **Connection String** દેખાશે:
   ```text
   postgresql://alex:AbCdEf123456@ep-cool-fog-123456.ap-southeast-1.aws.neon.tech/stock_market?sslmode=require
   ```
4. આ Connection String કોપી કરો અને તમારા `apps/api/.env` માં `DATABASE_URL` ની જગ્યાએ મૂકી દો:
   ```env
   DATABASE_URL="તમારી_NEON_CONNECTION_STRING_HERE"
   ```
5. ટર્મિનલમાં ફક્ત આ 2 કમાન્ડ રન કરો જેથી ક્લાઉડમાં બધા 27 ટેબલ્સ અને સીડ ડેટા (Stocks, Indices, IPOs, Users) જાતે અપલોડ થઈ જશે:
   ```bash
   cd apps/api
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
👉 **બસ! તમારો લાઈવ PostgreSQL ડેટાબેઝ ક્લાઉડમાં 100% સેટ થઈ ગયો!**

---

## 2. ⚡ ફ્રી બેકએન્ડ API + WebSocket લાઈવ ડિપ્લોયમેન્ટ (Render.com)

તમારા બેકએન્ડ (Express + Socket.IO WebSockets) ને ફ્રીમાં લાઈવ હોસ્ટ કરવા માટે:

1. **https://render.com** પર જઈને GitHub થી ફ્રી સાઈન અપ કરો.
2. **New +** -> **Web Service** પર ક્લિક કરો.
3. તમારું GitHub Repository પસંદ કરો: `kishansejani/stoke-market`
4. નીચે મુજબ સેટિંગ્સ ભરો:
   - **Name**: `stock-market-api`
   - **Region**: `Singapore` અથવા `Oregon`
   - **Root Directory**: `apps/api` (અથવા રૂટ રાખો)
   - **Environment**: `Node`
   - **Build Command**: `npm run build:api`
   - **Start Command**: `npm --workspace=@stock-market/api run start`
   - **Instance Type**: `Free`
5. **Environment Variables** માં આ વેલ્યુ ઉમેરો:
   - `DATABASE_URL`: (તમારી Neon વાળી કનેક્શન સ્ટ્રિંગ)
   - `JWT_ACCESS_SECRET`: `stock_jwt_live_super_secret_key_2026_xyz`
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `*`
6. **Deploy Web Service** પર ક્લિક કરો.
   - 2 મિનિટમાં તમને લાઈવ URL મળશે, ઉદાહરણ તરીકે:
   `https://stock-market-api.onrender.com`

---

## 3. 🌐 ફ્રી ફ્રન્ટએન્ડ લાઈવ ડિપ્લોયમેન્ટ (Vercel)

Vercel પર તમારા React + Tailwind + TradingView ફ્રન્ટએન્ડને 1-ક્લિકમાં લાઈવ કરો:

1. **https://vercel.com** પર જાઓ અને GitHub થી લોગિન કરો.
2. **Add New...** -> **Project** પર ક્લિક કરો.
3. તમારું રીપોઝીટરી સિલેક્ટ કરો: `kishansejani/stoke-market` (Import પર ક્લિક કરો).
4. Vercel પ્રોજેક્ટ સેટિંગ્સ:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (ખાલી રાખો, આપણી રૂટ `vercel.json` જાતે બધું હેન્ડલ કરશે)
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `apps/web/dist`
5. **Environment Variables** સેક્શનમાં આ 2 વેલ્યુ ઉમેરી દો:
   - `VITE_API_BASE_URL`: `https://stock-market-api.onrender.com/api/v1` (અથવા તમારો API URL)
   - `VITE_WS_BASE_URL`: `https://stock-market-api.onrender.com`
6. **Deploy** બટન પર ક્લિક કરો!
7. 60 સેકન્ડમાં તમને Vercel લાઈવ ડોમેઈન મળી જશે:
   `https://stoke-market.vercel.app`

---

## 4. 🕒 માર્કેટ ટાઈમિંગ્સ અને ઓટો-ફ્રીઝ ફીચર (Market Hours Control)

પ્લેટફોર્મ પર માર્કેટ સેશન્સ આપોઆપ ટ્રેક થાય છે:

1. **ભારતીય માર્કેટ (NSE / BSE)**:
   - સવારે 09:15 થી બપોરે 03:30 IST સુધી **OPEN** રહેશે અને લાઈવ ટિક્સ આપશે.
   - બપોરે 03:30 IST પછી માર્કેટ બંધ થતાં જ આપોઆપ **CLOSED** બેજ આવી જશે અને પ્રાઈસ ટિક્સ સ્થગિત (Frozen) થઈ જશે.
   - યુઝરને સ્ક્રીન પર નોટિફિકેશન દેખાશે: *"Market is currently CLOSED. Trading hours: 09:15 - 15:30 IST. Price ticks are frozen until next bell."*
   - ત્યાંથી એક ક્લિકમાં યુઝર યુએસ માર્કેટ જોઈ શકશે.

2. **અમેરિકન માર્કેટ (NASDAQ / NYSE)**:
   - યુએસ સમય મુજબ 09:30 AM ET થી 04:00 PM ET સુધી **OPEN** રહેશે અને તે સમયે લાઈવ ટિક્સ સ્ટ્રીમ થશે.

---

## 5. 🎯 IPO સેન્ટ્રલ ફીચર (GMP, Profit per Lot, Listing Gain)

નવું ઉમેરેલું **IPO Offerings** પેજ (`/ipo`):
- **સક્રિય / આગામી / લિસ્ટેડ IPOs**: Swiggy, Waaree Energies, Hyundai Motor India, NTPC Green, Enviro Infra, Arm Holdings, Reddit, Stripe.
- **GMP (Grey Market Premium)**: લાઈવ GMP અને Expected Listing Gain ટકાવારી.
- **Profit Calculator**: એપ્લીકેશન લોટ સાઈઝ (1 Lot, 2 Lots, 5 Lots) પસંદ કરીને રોકાણ અને અંદાજિત લિસ્ટિંગ નફો (Profit per Lot) ગણી શકાય છે.
- **સબસ્ક્રિપ્શન સ્ટેટસ**: QIB, NII, Retail અને Total સબસ્ક્રિપ્શન મલ્ટિપલ બાર્સ.

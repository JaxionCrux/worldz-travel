# Futuristic Airline Booking Platform

A modern, sleek flight booking platform built with Next.js, React, and TypeScript. This project showcases a futuristic UI design with advanced features for searching, booking, and managing flights.

## Features

- 🛫 **Flight Search**: Multi-city, one-way, and round-trip flight search
- 👪 **Passenger Selection**: Support for adults, children, and infants
- 💺 **Seat Selection**: Interactive seat map to choose your preferred seats
- 💳 **Payment Processing**: Secure payment integration with multiple payment methods
- 📱 **Responsive Design**: Works beautifully on all devices
- 🎫 **E-Ticket Generation**: Get your boarding pass delivered digitally
- 🔄 **Booking Management**: View and manage your bookings
- 🌙 **Dark Mode**: Futuristic dark theme throughout the application

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: Tailwind CSS, Radix UI, Shadcn/UI
- **State Management**: React hooks & context
- **Form Handling**: React Hook Form, Zod validation
- **API Integration**: Duffel Flight API
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **Animations**: Framer Motion

## Screenshots

![Homepage](https://images.example.com/homepage.png)
![Flight Search](https://images.example.com/flight-search.png)
![Flight Details](https://images.example.com/flight-details.png)
![Booking Process](https://images.example.com/booking-process.png)
![Seat Selection](https://images.example.com/seat-selection.png)
![Payment](https://images.example.com/payment.png)
![Booking Confirmation](https://images.example.com/booking-confirmation.png)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Duffel API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/futuristic-airline.git
   cd futuristic-airline
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   DUFFEL_API_KEY=your_duffel_api_key
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
futuristic-airline/
├── app/                    # Next.js app router pages
│   ├── actions/            # Server actions
│   ├── booking/            # Booking flow pages
│   ├── booking-confirmation/ # Confirmation page
│   ├── flight-details/     # Flight details page
│   └── api/                # API routes
├── components/             # Reusable components
│   ├── ui/                 # UI components (buttons, cards, etc.)
│   ├── flight-search-form/ # Flight search components
│   ├── seat-map/           # Seat selection components
│   └── booking-confirmation/ # Confirmation components
├── lib/                    # Utilities and libraries
│   ├── duffel.ts           # Duffel API integration
│   ├── duffel-payments.ts  # Payment integration
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── styles/                 # Global styles
```

## API Integration

This application integrates with the [Duffel API](https://duffel.com/docs/api) to provide real flight data, including:

- Flight search and filtering
- Fare pricing and availability
- Seat maps and seat selection
- Booking creation and management
- Payment processing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Duffel API](https://duffel.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://github.com/colinhacks/zod)

---

Created with ❤️ by [Your Name] 
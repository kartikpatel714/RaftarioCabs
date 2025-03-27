// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sample data (would normally come from database)
const fares = [
    {
        from: 'Abu Road',
        routes: [
            { name: 'Abu Road to Ahmedabad Taxi', slug: 'abu-road-ahmedabad' },
            { name: 'Abu Road to Ahmedabad Airport Taxi', slug: 'abu-road-ahmedabad-airport' },
            { name: 'Abu Road to Udaipur Taxi', slug: 'abu-road-udaipur' },
            { name: 'Abu Road to Vadodara Taxi', slug: 'abu-road-vadodara' },
            { name: 'Abu Road to Sokrda Taxi', slug: 'abu-road-sokrda' }
        ]
    },
    // Add more fare groups as needed
];

const faqs = [
    {
        question: 'How do I book a taxi?',
        answer: 'You can book a taxi through our website, mobile app, or by calling our helpline.'
    },
    // Add more FAQs as needed
];

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home',
        fares,
        faqs,
        contact: {
            phone: '0800-123-4567',
            email: 'support@raftariocabs.com'
        },
        googleApiKey: process.env.GOOGLE_API_KEY || 'YOUR_API_KEY'
    });
});

// Updated error handling in app.js
app.post('/submit-form', async (req, res) => {
    try {
        // const { formType, pickup, drop } = req.body;
        const formType = "daily"
        const pickup = "Vadodara"
        const drop = "Ahmdabad"

        // Validate input
        if (!pickup || !drop) {
            return res.status(400).render('error', {
                title: 'Input Error',
                message: 'Please provide both pickup and drop locations'
            });
        }

        if (!['daily', 'rental', 'outstation'].includes(formType)) {
            return res.status(400).render('error', {
                title: 'Invalid Service Type',
                message: 'Please select a valid service type (daily, rental, or outstation)'
            });
        }

        // Calculate fares based on form type
        const fareData = await calculateFare(formType, pickup, drop);

        // Prepare cab types data
        const cabTypes = [
            {
                type: 'AC HATCHBACK',
                models: 'Indica Vista, Suzuki Swift, Hyundai Eon',
                image: '/images/hatchback.png',
                fare: fareData.hatchback
            },
            {
                type: 'AC SEDAN',
                models: 'Swift Dzire, Toyota Etios, Honda Amaze',
                image: '/images/sedan.png',
                fare: fareData.sedan
            },
            {
                type: 'AC SUV',
                models: 'Toyota Innova, Mahindra Xylo',
                image: '/images/suv.png',
                fare: fareData.suv
            }
        ];

        // Prepare route-specific FAQs
        const routeFaqs = [
            {
                question: `What are the options available for ${pickup} to ${drop}?`,
                answer: 'We offer Hatchback, Sedan and SUV options for this route.'
            },
            {
                question: `What is the taxi fare from ${pickup} to ${drop}?`,
                answer: `Fares start from ₹${fareData.hatchback.toFixed(2)} for Hatchback.`
            },
            {
                question: 'How much is Toll for this route?',
                answer: 'Approx. ₹150-200 depending on the route taken.'
            }
        ];

        // Render fare results page
        res.render('fare-result', {
            title: 'Fare Estimate',
            formType,
            pickup,
            drop,
            cabTypes,
            faqs: routeFaqs,
            googleApiKey: process.env.GOOGLE_API_KEY || 'YOUR_API_KEY'
        });

    } catch (error) {
        console.error('Error calculating fare:', error);
        res.status(500).render('error', {
            title: 'Server Error',
            message: 'An error occurred while calculating fares. Please try again later.'
        });
    }
});

app.get('/book-ride', (req, res) => {
    const { pickup, drop, carType, fare } = req.query;

    if (!pickup || !drop || !carType || !fare) {
        return res.redirect('/?error=Missing booking parameters');
    }

    res.render('booking-form', {
        title: 'Confirm Your Ride',
        pickup,
        drop,
        carType,
        fare: parseFloat(fare).toFixed(2)
    });
});

// Booking submission API endpoint
app.post('/api/bookings', (req, res) => {
    try {
        const {
            pickup,
            drop,
            carType,
            fare,
            userName,
            mobile,
            pickupDetail,
            dropDetail,
            gstNumber
        } = req.body;

        // Validate required fields
        if (!userName || !mobile || !pickupDetail || !dropDetail) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields'
            });
        }

        // Create booking (in real app, save to database)
        const bookingId = 'B' + Date.now().toString().slice(-8);

        res.json({
            success: true,
            bookingId,
            message: 'Booking confirmed successfully'
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your booking'
        });
    }
});

// Add to app.js
app.get('/booking-confirmation/:id', (req, res) => {
    // In a real app, you would fetch the booking from your database
    const booking = {
        bookingId: req.params.id,
        pickup: req.query.pickup || "Vadodara",
        drop: req.query.drop || "Ahmedabad",
        carType: req.query.carType || "AC HATCHBACK",
        fare: req.query.fare || "1200.00",
        userName: req.query.userName || "John Doe",
        mobile: req.query.mobile || "9876543210"
    };

    res.render('booking-confirmation', {
        title: 'Booking Confirmed',
        booking
    });
});


const userData = {
    name: "Karth Patel",
    membership: "Gold Member",
    avatar: "https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/man-light-skin-tone.png",
    stats: {
        totalRides: 24,
        completed: 18,
        upcoming: 3,
        cancelled: 3
    },
    recentActivity: [
        {
            icon: "fa-car",
            text: "Your booking #51719618 has been completed",
            time: "2 hours ago"
        },
        {
            icon: "fa-wallet",
            text: "Payment of ₹1600 received for booking #51719618",
            time: "5 hours ago"
        },
        {
            icon: "fa-star",
            text: "You earned 15 loyalty points for your ride",
            time: "Yesterday"
        },
        {
            icon: "fa-calendar-alt",
            text: "New booking #62348721 confirmed for April 15",
            time: "2 days ago"
        }
    ],
    bookings: [
        {
            id: "51719618",
            status: "completed",
            route: "Vadodara → Ahmedabad",
            date: "Mar 26, 2025 • 17:30-19:30",
            vehicle: "FORD FIGO ASPIRE (GJ-06-AX-4033)",
            amount: "₹1600",
            buttons: [
                { type: "primary", icon: "fa-receipt", text: "Receipt" },
                { type: "secondary", icon: "fa-redo", text: "Repeat" }
            ]
        },
        {
            id: "62348721",
            status: "upcoming",
            route: "Mumbai → Pune",
            date: "Apr 15, 2025 • 09:00-12:30",
            vehicle: "Toyota Innova",
            amount: "₹2500",
            buttons: [
                { type: "primary", icon: "fa-edit", text: "Modify" },
                { type: "secondary", icon: "fa-times", text: "Cancel" }
            ]
        },
        {
            id: "89234567",
            status: "ongoing",
            route: "Delhi → Gurgaon",
            date: "Mar 28, 2025 • 14:00-15:30",
            driver: "Rajesh Kumar (+91 98765 43210)",
            vehicle: "Hyundai Creta",
            buttons: [
                { type: "primary", icon: "fa-phone-alt", text: "Call Driver" },
                { type: "secondary", icon: "fa-map-marker-alt", text: "Track" }
            ]
        }
    ]
};

// Route to render the dashboard
app.get('/dashboard', (req, res) => {
    res.render('dashboard', { user: userData });
});


// Enhanced fare calculation function
async function calculateFare(formType, pickup, drop) {
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 500));

    // Base fares based on service type
    const baseFares = {
        daily: { base: 500, multiplier: 10 },
        rental: { base: 2000, multiplier: 8 },
        outstation: { base: 3000, multiplier: 12 }
    };

    // Calculate random distance between 10-100km for demo
    const distance = Math.floor(Math.random() * 90) + 10;

    // Calculate fares for different vehicle types
    const baseConfig = baseFares[formType] || baseFares.daily;
    const baseFare = baseConfig.base;
    const multiplier = baseConfig.multiplier;

    return {
        hatchback: baseFare + (distance * multiplier),
        sedan: baseFare + (distance * (multiplier + 2)),
        suv: baseFare + (distance * (multiplier + 4)),
        distance: distance
    };
}


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
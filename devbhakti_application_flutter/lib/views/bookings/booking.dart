import 'package:devbhakti/views/base/drawer.dart';
import 'package:flutter/material.dart';

class Bookings extends StatefulWidget {
  const Bookings({super.key});

  @override
  State<Bookings> createState() => _BookingsState();
}

class _BookingsState extends State<Bookings> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Mock Data for Upcoming
  final List<Map<String, dynamic>> upcomingBookings = [
    {
      "id": "#BK2023001",
      "temple": "Kashi Vishwanath",
      "location": "Varanasi, UP",
      "date": "14 Oct, 2023",
      "time": "04:00 AM",
      "puja": "Special Abhishekam",
      "amount": "₹1100",
      "status": "Confirmed",
      "image": "https://devbhakti.koubcafe.in/_next/static/media/temple-kashi.36ab7a78.jpg"
    },
    {
      "id": "#BK2023004",
      "temple": "Tirupati Balaji",
      "location": "Tirupati, AP",
      "date": "20 Oct, 2023",
      "time": "06:00 AM",
      "puja": "General Darshan",
      "amount": "₹200",
      "status": "Pending",
      "image": "https://devbhakti.koubcafe.in/_next/static/media/temple-tirupati.26682397.jpg"
    },
  ];

  // Mock Data for History
  final List<Map<String, dynamic>> historyBookings = [
    {
      "id": "#BK2022998",
      "temple": "Siddhivinayak",
      "location": "Mumbai, MH",
      "date": "02 Sept, 2023",
      "puja": "Prasad Offering",
      "amount": "₹501",
      "status": "Completed",
      "image": "https://devbhakti.koubcafe.in/_next/static/media/temple-siddhivinayak.98d2674b.jpg"
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF9F9F9),
      endDrawer: ModernDrawer(),
      appBar: AppBar(
        automaticallyImplyLeading: false,

        elevation: 0,
        backgroundColor: Colors.white,
        centerTitle: true,
        title: Text(
          "My Bookings",
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        iconTheme: IconThemeData(color: Colors.black87),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Color(0xFF6C63FF), // Primary color
          labelColor: Color(0xFF6C63FF),
          unselectedLabelColor: Colors.grey,
          labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          tabs: [
            Tab(text: "Upcoming"),
            Tab(text: "History"),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildBookingList(upcomingBookings, isUpcoming: true),
          _buildBookingList(historyBookings, isUpcoming: false),
        ],
      ),
    );
  }

  Widget _buildBookingList(List bookings, {required bool isUpcoming}) {
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 80, color: Colors.grey[300]),
            SizedBox(height: 20),
            Text(
              isUpcoming ? "No Upcoming Bookings" : "No Past Bookings",
              style: TextStyle(fontSize: 18, color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: bookings.length,
      itemBuilder: (context, index) {
        final booking = bookings[index];
        return Container(
          margin: EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 15,
                offset: Offset(0, 5),
              )
            ],
          ),
          child: Column(
            children: [
              // Header Image
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                    child: Image.network(
                      booking['image'],
                      height: 140,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  // Status Badge
                  Positioned(
                    top: 15,
                    right: 15,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _getStatusColor(booking['status']).withOpacity(0.9),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4,
                          )
                        ],
                      ),
                      child: Text(
                        booking['status'],
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  // Booking ID
                  Positioned(
                    bottom: 10,
                    left: 15,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        booking['id'],
                        style: TextStyle(color: Colors.white, fontSize: 11),
                      ),
                    ),
                  )
                ],
              ),

              // Details
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            booking['temple'],
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                        Text(
                          booking['amount'],
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF6C63FF),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined, size: 16, color: Colors.grey),
                        SizedBox(width: 4),
                        Text(
                          booking['location'],
                          style: TextStyle(color: Colors.grey[600], fontSize: 13),
                        ),
                      ],
                    ),
                    SizedBox(height: 16),

                    // Row for Date, Time, Puja
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildInfoChip(Icons.calendar_today, booking['date']),
                        // _buildInfoChip(Icons.access_time, booking['time']),
                        Container(
                          // constraints: BoxConstraints(maxWidth: 100),
                          child: _buildInfoChip(Icons.spellcheck, booking['puja']),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Action Footer
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Color(0xFFF8F9FA),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(20),
                    bottomRight: Radius.circular(20),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // QR Code Placeholder
                    Row(
                      children: [
                        Container(
                          height: 35,
                          width: 35,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey[300]!),
                          ),
                          child: Icon(Icons.qr_code_2, size: 24, color: Colors.black87),
                        ),
                        SizedBox(width: 8),
                        Text(
                          "View Ticket",
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.black54,
                          ),
                        ),
                      ],
                    ),

                    // Buttons based on status
                    if (isUpcoming)
                      Row(
                        children: [
                          if (booking['status'] == "Pending")
                            TextButton(
                              onPressed: () {},
                              child: Text("Cancel", style: TextStyle(color: Colors.red)),
                            ),
                          if (booking['status'] == "Confirmed")
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: Color(0xFF6C63FF),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                "Track Status",
                                style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            )
                        ],
                      )
                    else
                      TextButton.icon(
                        onPressed: () {},
                        icon: Icon(Icons.refresh, size: 16),
                        label: Text("Book Again", style: TextStyle(color: Color(0xFF6C63FF))),
                      )
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: Color(0xFF6C63FF)),
        SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.black87),
        ),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case "Confirmed":
        return Colors.green;
      case "Pending":
        return Colors.orange;
      case "Completed":
        return Colors.blueGrey;
      case "Cancelled":
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
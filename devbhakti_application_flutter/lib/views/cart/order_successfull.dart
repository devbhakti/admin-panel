import 'package:devbhakti/views/dashboard/dashboard.dart';
import 'package:flutter/material.dart';
import 'dart:math' as math;

import 'package:get/get.dart';

class OrderSuccessfull extends StatefulWidget {
  const OrderSuccessfull({super.key});

  @override
  State<OrderSuccessfull> createState() => _OrderSuccessfullState();
}

class _OrderSuccessfullState extends State<OrderSuccessfull>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black.withOpacity(0.6), // Dark backdrop
      body: Center(
        child: ScaleTransition(
          scale: _scaleAnimation,
          child: Container(
            margin: EdgeInsets.symmetric(horizontal: 20),
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 20,
                  offset: Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(height: 20),

                // --- Animated Success Icon ---
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.green[50],
                      ),
                    ),
                    // Confetti particles
                    Positioned(
                      top: 0,
                      left: 10,
                      child: _confettiParticle(Colors.red, 0),
                    ),
                    Positioned(
                      bottom: 10,
                      right: 0,
                      child: _confettiParticle(Colors.orange, 1),
                    ),
                    Positioned(
                      top: 10,
                      right: 10,
                      child: _confettiParticle(Colors.purple, 2),
                    ),

                    // Main Heart Icon
                    Container(
                      height: 70,
                      width: 70,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.green,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.green.withOpacity(0.4),
                            blurRadius: 15,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 35,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 30),

                // --- Text Content ---
                Text(
                  "Order Book Successful!",
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 10),
                Text(
                  "Booking successful! Your request has been confirmed. Thank you for choosing us.",
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),

                SizedBox(height: 25),

                // --- Receipt Divider ---
                // Padding(
                //   padding: const EdgeInsets.symmetric(horizontal: 20.0),
                //   child: Row(
                //     children: [
                //       Expanded(child: Divider(color: Colors.grey[300])),
                //       Padding(
                //         padding: const EdgeInsets.symmetric(horizontal: 10),
                //         child: Text("RECEIPT", style: TextStyle(fontSize: 10, color: Colors.grey)),
                //       ),
                //       Expanded(child: Divider(color: Colors.grey[300])),
                //     ],
                //   ),
                // ),
                //
                // SizedBox(height: 15),
                //
                // // --- Transaction Details ---
                // _buildDetailRow("Transaction ID", "#TXN8849201"),
                // SizedBox(height: 12),
                // _buildDetailRow("Amount Donated", "₹1,001", isBold: true, color: Colors.green),
                // SizedBox(height: 12),
                // _buildDetailRow("Date", "Oct 24, 2023"),
                // SizedBox(height: 12),
                // _buildDetailRow("Payment Mode", "UPI / GPay"),
                //
                // SizedBox(height: 30),

                // --- Action Button ---
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      Get.offAll(()=>Dashboard());
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      "Back to Home",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),

                SizedBox(height: 10),

                // TextButton(
                //   onPressed: () {
                //     Navigator.pop(context);
                //   },
                //   child: Text(
                //     "Download Receipt",
                //     style: TextStyle(
                //       fontSize: 13,
                //       color: Colors.grey,
                //       decoration: TextDecoration.underline,
                //     ),
                //   ),
                // // ),
                //
                // SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: Colors.grey[500],
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: color ?? Colors.black87,
          ),
        ),
      ],
    );
  }

  // Simple decorative confetti
  Widget _confettiParticle(Color color, int seed) {
    return Transform.rotate(
      angle: math.Random(seed).nextDouble() * 6.28,
      child: Container(
        height: 10,
        width: 5,
        color: color,
      ),
    );
  }
}
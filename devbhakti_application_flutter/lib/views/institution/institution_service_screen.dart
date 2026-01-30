import 'package:flutter/material.dart';

class InstitutionServiceScreen extends StatelessWidget {
  const InstitutionServiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.orange.withOpacity(0.1), Colors.white],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.auto_awesome_outlined, size: 80, color: Colors.orange),
              SizedBox(height: 20),
              Text("Add Services & Poojas", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              SizedBox(height: 10),
              Text("Define the divine experiences you offer.", style: TextStyle(color: Colors.grey)),
            ],
          ),
        ),
      ),
    );
  }
}

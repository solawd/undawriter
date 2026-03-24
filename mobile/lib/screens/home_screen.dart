import 'package:flutter/material.dart';
import 'package:undawriter_insure/screens/quote_screen.dart';
import 'package:undawriter_insure/screens/claim_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('UndaWriter Insure'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(
              Icons.shield_outlined,
              size: 100,
              color: Color(0xFF061944), // Primary
            ),
            const SizedBox(height: 32),
            const Text(
              'Welcome to UndaWriter',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF061944),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const QuoteScreen()));
              },
              icon: const Icon(Icons.calculate),
              label: const Text('Get a Quote & Buy Policy', style: TextStyle(fontSize: 18)),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ClaimScreen()));
              },
              icon: const Icon(Icons.camera_alt),
              label: const Text('Submit a Claim', style: TextStyle(fontSize: 18)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: const BorderSide(color: Color(0xFF4F98CD), width: 2), // Secondary
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

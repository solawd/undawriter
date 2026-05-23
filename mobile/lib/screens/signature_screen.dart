import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:signature/signature.dart';
import 'package:undawriter_insure/services/api_service.dart';
import 'package:undawriter_insure/screens/main_layout.dart';

class SignatureScreen extends StatefulWidget {
  final String policyId;

  const SignatureScreen({super.key, required this.policyId});

  @override
  State<SignatureScreen> createState() => _SignatureScreenState();
}

class _SignatureScreenState extends State<SignatureScreen> {
  final SignatureController _signatureController = SignatureController(
    penStrokeWidth: 3,
    penColor: Colors.black,
    exportBackgroundColor: Colors.transparent,
  );

  bool _isLoading = false;

  @override
  void dispose() {
    _signatureController.dispose();
    super.dispose();
  }

  void _submitSignature() async {
    if (_signatureController.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please provide your signature before submitting.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final bytes = await _signatureController.toPngBytes();
      if (bytes == null) {
        throw Exception('Failed to generate signature image.');
      }
      
      final base64String = 'data:image/png;base64,${base64Encode(bytes)}';

      await ApiService.signPolicy(widget.policyId, base64String);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Signature submitted successfully! Policy documents have been emailed to you.')),
      );

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MainLayout()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit signature: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign Policy Document'),
        // Prevent accidental back navigation since payment is already done
        automaticallyImplyLeading: false, 
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Standard Motor Insurance Policy Terms',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF061944)),
            ),
            const SizedBox(height: 16),
            const Text(
              'This Policy is a contract of insurance between you (the Policyholder) and UndaWriter Insure. '
              'In consideration of the payment of the premium, we will provide insurance in accordance with '
              'the terms, conditions, exceptions, and endorsements contained in this document.',
              style: TextStyle(fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 12),
            const Text(
              '1. General Conditions: The vehicle must be maintained in a roadworthy condition. '
              'You must take all reasonable steps to safeguard the vehicle from loss or damage.',
              style: TextStyle(fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 12),
            const Text(
              '2. Claims: In the event of an accident, theft, or damage, you must notify us '
              'immediately. No admission of liability or offer of payment should be made without our written consent.',
              style: TextStyle(fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 12),
            const Text(
              '3. Cancellation: This policy may be cancelled by you at any time. A pro-rata refund '
              'will only be issued subject to no claims having been made during the current period of insurance.',
              style: TextStyle(fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 12),
            const Text(
              'By signing below, I declare that the particulars provided during this application are true '
              'and complete to the best of my knowledge, and I accept the terms and conditions outlined above.',
              style: TextStyle(fontSize: 14, height: 1.5, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            const Text('Draw your signature below:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Signature(
                  controller: _signatureController,
                  height: 200,
                  backgroundColor: Colors.grey[100]!,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () => _signatureController.clear(),
                icon: const Icon(Icons.clear),
                label: const Text('Clear'),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submitSignature,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF061944),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isLoading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Submit Signature & Finalize', style: TextStyle(color: Colors.white, fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}

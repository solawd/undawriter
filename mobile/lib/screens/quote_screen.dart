import 'package:flutter/material.dart';

import 'package:undawriter_insure/screens/payment_screen.dart';
import 'package:undawriter_insure/services/api_service.dart';

class QuoteScreen extends StatefulWidget {
  const QuoteScreen({super.key});

  @override
  State<QuoteScreen> createState() => _QuoteScreenState();
}

class _QuoteScreenState extends State<QuoteScreen> {
  final _formKey = GlobalKey<FormState>();
  
  String _productType = 'MOTOR';
  String _usage = 'PRIVATE';
  String _coverageType = 'COMPREHENSIVE';

  final _sumInsuredController = TextEditingController();
  final _regNumberController = TextEditingController();
  final _chassisNumberController = TextEditingController();
  final _makeModelController = TextEditingController();
  final _yearController = TextEditingController();
  final _bodyTypeController = TextEditingController();
  final _seatingCapacityController = TextEditingController();
  final _durationMonthsController = TextEditingController(text: '12');

  Map<String, dynamic>? _quote;
  bool _isLoading = false;

  void _calculateQuote() async {
    if (!_formKey.currentState!.validate()) return;

    double sum = double.tryParse(_sumInsuredController.text) ?? 0.0;
    if (sum <= 0) return;

    setState(() => _isLoading = true);

    try {
      final quoteResponse = await ApiService.calculateQuote({
        'productType': _productType,
        'sumInsured': sum,
      });

      if (mounted) {
        setState(() {
          _quote = {
             'base': quoteResponse['basePremium']?.toStringAsFixed(2) ?? '0.00',
             'nic': quoteResponse['nicLevy']?.toStringAsFixed(2) ?? '0.00',
             'total': quoteResponse['totalPremium']?.toStringAsFixed(2) ?? '0.00',
          };
          _isLoading = false;
        });
        _showQuoteBottomSheet();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to calculate quote: $e')),
        );
      }
    }
  }

  void _showQuoteBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            left: 24,
            right: 24,
            top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                color: const Color(0xFFF3F8FB),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: const BorderSide(color: Color(0xFF4F98CD), width: 1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Your Quote', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF061944))),
                      const SizedBox(height: 16),
                      Text('Base Premium: GHS ${_quote!['base']}'),
                      Text('NIC Levy (1.5%): GHS ${_quote!['nic']}'),
                      const Text('Sticker Fee: GHS 1.50'),
                      const Divider(height: 32),
                      Text(
                        'Total: GHS ${_quote!['total']}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF061944)),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Close the modal
                  _proceedToPayment();    // Proceed to payment screen
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF061944),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Buy Policy', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ],
          ),
        );
      },
    );
  }

  void _proceedToPayment() {
    if (!_formKey.currentState!.validate()) return;
    
    double sum = double.tryParse(_sumInsuredController.text) ?? 0.0;
    double totalPremium = double.tryParse(_quote!['total'].toString()) ?? 0.0;
    
    final policyData = {
      'regNumber': _regNumberController.text,
      'chassisNumber': _chassisNumberController.text,
      'makeModel': _makeModelController.text,
      'year': int.tryParse(_yearController.text) ?? 2021,
      'bodyType': _bodyTypeController.text,
      'seatingCapacity': int.tryParse(_seatingCapacityController.text) ?? 5,
      'usage': _usage,
      'coverageType': _coverageType,
      'sumInsured': sum,
      'durationMonths': int.tryParse(_durationMonthsController.text) ?? 12,
      'totalPremium': totalPremium,
    };

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PaymentScreen(
          policyData: policyData,
          totalPremium: totalPremium,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Get a Quote'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: _productType,
                decoration: const InputDecoration(labelText: 'Product Type', border: OutlineInputBorder()),
                items: ['MOTOR', 'HOME', 'TRAVEL']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (val) {
                  setState(() {
                    _productType = val!;
                    _quote = null; // reset quote if product changes
                  });
                },
              ),
              if (_productType == 'MOTOR') ...[
                const SizedBox(height: 16),
                const Text('Vehicle Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF061944))),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _makeModelController,
                  decoration: const InputDecoration(labelText: 'Make & Model (e.g. Toyota Corolla)', border: OutlineInputBorder()),
                  validator: (v) => v!.isEmpty ? 'Required field' : null,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _regNumberController,
                        decoration: const InputDecoration(labelText: 'Registration Number', border: OutlineInputBorder()),
                        validator: (v) => v!.isEmpty ? 'Required field' : null,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _yearController,
                        decoration: const InputDecoration(labelText: 'Year', border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                        validator: (v) => v!.isEmpty ? 'Required field' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _chassisNumberController,
                  decoration: const InputDecoration(labelText: 'Chassis Number (VIN)', border: OutlineInputBorder()),
                  validator: (v) => v!.isEmpty ? 'Required field' : null,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _bodyTypeController,
                        decoration: const InputDecoration(labelText: 'Body Type (e.g. Sedan)', border: OutlineInputBorder()),
                        validator: (v) => v!.isEmpty ? 'Required field' : null,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _seatingCapacityController,
                        decoration: const InputDecoration(labelText: 'Seats', border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                        validator: (v) => v!.isEmpty ? 'Required field' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _usage,
                        decoration: const InputDecoration(labelText: 'Usage', border: OutlineInputBorder()),
                        items: ['PRIVATE', 'COMMERCIAL']
                            .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                            .toList(),
                        onChanged: (val) => setState(() => _usage = val!),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _coverageType,
                        decoration: const InputDecoration(labelText: 'Coverage Type', border: OutlineInputBorder()),
                        items: ['COMPREHENSIVE', 'THIRD_PARTY']
                            .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                            .toList(),
                        onChanged: (val) => setState(() => _coverageType = val!),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 16),
              const Text('Coverage Amount', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF061944))),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _sumInsuredController,
                      decoration: const InputDecoration(labelText: 'Sum Insured (GHS)', border: OutlineInputBorder()),
                      keyboardType: TextInputType.number,
                      validator: (v) => v!.isEmpty ? 'Required field' : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _durationMonthsController,
                      decoration: const InputDecoration(labelText: 'Duration (Months)', border: OutlineInputBorder()),
                      keyboardType: TextInputType.number,
                      validator: (v) => v!.isEmpty ? 'Required field' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _calculateQuote,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Calculate Premium', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

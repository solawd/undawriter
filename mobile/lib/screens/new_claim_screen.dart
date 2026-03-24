import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:undawriter_insure/services/api_service.dart';

class NewClaimScreen extends StatefulWidget {
  const NewClaimScreen({super.key});

  @override
  State<NewClaimScreen> createState() => _NewClaimScreenState();
}

class _NewClaimScreenState extends State<NewClaimScreen> {
  String? _selectedPolicyId;
  final _descController = TextEditingController();
  String _payoutType = 'CASH_IN_LIEU';
  final List<File> _imageFiles = [];
  bool _isLoading = false;
  bool _isFetchingPolicies = true;
  List<dynamic> _policies = [];

  @override
  void initState() {
    super.initState();
    _loadPolicies();
  }

  Future<void> _loadPolicies() async {
    try {
      final allPolicies = await ApiService.getUserPolicies();
      final activePolicies = allPolicies.where((p) => p['policy']?['status'] == 'ACTIVE').toList();
      setState(() {
        _policies = activePolicies;
        if (_policies.isNotEmpty) {
          _selectedPolicyId = _policies.first['policy']['id'].toString();
        }
        _isFetchingPolicies = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isFetchingPolicies = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load policies: $e')),
        );
      }
    }
  }

  void _pickImages() async {
    final ImagePicker picker = ImagePicker();
    final List<XFile> images = await picker.pickMultiImage();
    
    if (images.isNotEmpty) {
      setState(() {
        _imageFiles.addAll(images.map((img) => File(img.path)));
      });
    }
  }

  void _submitClaim() async {
    if (_selectedPolicyId == null || _descController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a policy and provide a description.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ApiService.submitClaim(
        _selectedPolicyId!,
        _payoutType,
        _descController.text,
        _imageFiles.isNotEmpty ? _imageFiles : null,
      );

      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _descController.clear();
        _imageFiles.clear();
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Claim submitted successfully!')),
      );
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) Navigator.pop(context);
      });

    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Claim failed to upload: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('File a New Claim')),
      body: _isFetchingPolicies 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_policies.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.red[50],
                child: const Text('You have no active policies to file a claim for.', style: TextStyle(color: Colors.red)),
              )
            else
              DropdownButtonFormField<String>(
                value: _selectedPolicyId,
                decoration: const InputDecoration(labelText: 'Select Policy', border: OutlineInputBorder()),
                items: _policies.map((p) {
                  final policy = p['policy'];
                  final motorDetails = p['motorDetails'];
                  String label = '${policy['productType']} Insurance - POL-${policy['id']}';
                  if (motorDetails != null) {
                    label = '${motorDetails['makeModel']} (${motorDetails['regNumber']}) - POL-${policy['id']}';
                  }
                  return DropdownMenuItem(
                    value: policy['id'].toString(),
                    child: Text(label, overflow: TextOverflow.ellipsis),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedPolicyId = val),
              ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _payoutType,
              decoration: const InputDecoration(labelText: 'Payout Preference', border: OutlineInputBorder()),
              items: ['CASH_IN_LIEU', 'SERVICE_PROVIDER']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e == 'CASH_IN_LIEU' ? 'Cash in Lieu' : 'Service Provider')))
                  .toList(),
              onChanged: (val) => setState(() => _payoutType = val!),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Description of Damage', border: OutlineInputBorder(), alignLabelWithHint: true),
              maxLines: 5,
            ),
            const SizedBox(height: 32),
            OutlinedButton.icon(
              onPressed: _pickImages,
              icon: Icon(_imageFiles.isNotEmpty ? Icons.check_circle : Icons.upload_file, 
                color: _imageFiles.isNotEmpty ? Colors.green : const Color(0xFF4F98CD)),
              label: Text(_imageFiles.isNotEmpty ? '${_imageFiles.length} Evidence(s) Attached' : 'Upload Photos/Documents', 
                style: const TextStyle(fontSize: 16)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: BorderSide(color: _imageFiles.isNotEmpty ? Colors.green : const Color(0xFF4F98CD), width: 2),
              ),
            ),
            if (_imageFiles.isNotEmpty) ...[
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _imageFiles.map((f) => Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 80, height: 80,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(f, fit: BoxFit.cover),
                      ),
                    ),
                    Positioned(
                      top: -8, right: -8,
                      child: GestureDetector(
                        onTap: () => setState(() => _imageFiles.remove(f)),
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                          child: const Icon(Icons.close, color: Colors.white, size: 16),
                        ),
                      ),
                    ),
                  ]
                )).toList(),
              )
            ],
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: (_isLoading || _selectedPolicyId == null) ? null : _submitClaim,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF061944),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Submit Claim', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}

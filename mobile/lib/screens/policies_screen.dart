import 'package:flutter/material.dart';
import 'package:undawriter_insure/screens/policy_detail_screen.dart';
import 'package:undawriter_insure/services/api_service.dart';
import 'package:undawriter_insure/screens/quote_screen.dart';

class PoliciesScreen extends StatefulWidget {
  const PoliciesScreen({super.key});

  @override
  State<PoliciesScreen> createState() => _PoliciesScreenState();
}

class _PoliciesScreenState extends State<PoliciesScreen> {
  bool _isLoading = true;
  List<dynamic> _policies = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPolicies();
  }

  Future<void> _loadPolicies() async {
    try {
      final policies = await ApiService.getUserPolicies();
      setState(() {
        _policies = policies;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load policies: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('My Policies'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'Create New Policy',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const QuoteScreen()),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _policies.isEmpty
              ? _buildEmptyState(context)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _policies.length,
                  itemBuilder: (context, index) {
                    final policy = _policies[index];
                    return _buildPolicyCard(context, policy);
                  },
                ),
      floatingActionButton: _policies.isNotEmpty 
        ? FloatingActionButton.extended(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const QuoteScreen()),
              );
            },
            icon: const Icon(Icons.add, color: Colors.white),
            label: const Text('Create New Policy', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            backgroundColor: Theme.of(context).primaryColor,
          )
        : null,
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.shield_outlined, size: 80, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            'No Active Policies',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          const Text('You do not have any active insurance policies yet.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildPolicyCard(BuildContext context, Map<String, dynamic> policyData) {
    final policy = policyData['policy'] ?? {};
    final motorDetails = policyData['motorDetails'];
    
    final productType = policy['productType']?.toString() ?? 'UNKNOWN';
    IconData icon;
    if (productType == 'MOTOR') {
      icon = Icons.directions_car;
    } else if (productType == 'HOME') {
      icon = Icons.home;
    } else {
      icon = Icons.flight;
    }

    String vehicleOrProperty = '';
    if (productType == 'MOTOR' && motorDetails != null) {
      final makeModel = motorDetails['makeModel']?.toString() ?? 'Unknown Vehicle';
      final regNo = motorDetails['regNumber']?.toString() ?? 'No Reg';
      vehicleOrProperty = '$makeModel ($regNo)';
    }

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PolicyDetailScreen(policy: policyData),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F8FB),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, color: const Color(0xFF061944)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$productType INSURANCE',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF061944)),
                        ),
                        const SizedBox(height: 4),
                        Text('Policy #: ${policy['id']}', style: TextStyle(color: Colors.grey[700])),
                        if (vehicleOrProperty.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(vehicleOrProperty, style: TextStyle(color: Colors.blueGrey[700], fontSize: 12)),
                        ]
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.green[50],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      policy['status']?.toString() ?? 'PENDING',
                      style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
              const Divider(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Valid Until', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      const SizedBox(height: 4),
                      Text(policy['endDate']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.w500)),
                    ],
                  ),
                  const Icon(Icons.chevron_right, color: Colors.grey),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}

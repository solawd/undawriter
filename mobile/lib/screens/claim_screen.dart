import 'package:flutter/material.dart';
import 'package:undawriter_insure/services/api_service.dart';
import 'package:undawriter_insure/screens/new_claim_screen.dart';
import 'package:undawriter_insure/screens/claim_detail_screen.dart' as undawriter_insure_claim_detail;

class ClaimScreen extends StatefulWidget {
  const ClaimScreen({super.key});

  @override
  State<ClaimScreen> createState() => _ClaimScreenState();
}

class _ClaimScreenState extends State<ClaimScreen> {
  bool _isLoading = true;
  List<dynamic> _claims = [];

  @override
  void initState() {
    super.initState();
    _loadClaims();
  }

  Future<void> _loadClaims() async {
    try {
      final claims = await ApiService.getUserClaims();
      setState(() {
        _claims = claims;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load claims: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('My Claims'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'File New Claim',
            onPressed: () async {
              // Wait for the new claim screen to pop, then reload
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NewClaimScreen()),
              );
              setState(() => _isLoading = true);
              _loadClaims();
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _claims.isEmpty
              ? _buildEmptyState(context)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _claims.length,
                  itemBuilder: (context, index) {
                    final claim = _claims[index];
                    return _buildClaimCard(context, claim);
                  },
                ),
      floatingActionButton: _claims.isNotEmpty 
        ? FloatingActionButton.extended(
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NewClaimScreen()),
              );
              setState(() => _isLoading = true);
              _loadClaims();
            },
            icon: const Icon(Icons.add, color: Colors.white),
            label: const Text('File New Claim', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            backgroundColor: Theme.of(context).primaryColor,
          )
        : null,
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.folder_open, size: 64, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Text(
              'No Claims Found',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'You haven\'t filed any claims yet.',
              style: TextStyle(color: Colors.grey, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const NewClaimScreen()),
                );
                setState(() => _isLoading = true);
                _loadClaims();
              },
              icon: const Icon(Icons.add),
              label: const Text('File a New Claim'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildClaimCard(BuildContext context, Map<String, dynamic> claim) {
    final status = claim['status']?.toString() ?? 'RECEIVED';
    Color statusColor;
    Color statusBgColor;

    if (status == 'APPROVED') {
      statusColor = Colors.green[700]!;
      statusBgColor = Colors.green[50]!;
    } else if (status == 'REJECTED') {
      statusColor = Colors.red[700]!;
      statusBgColor = Colors.red[50]!;
    } else if (status == 'UNDER_REVIEW') {
      statusColor = Colors.orange[700]!;
      statusBgColor = Colors.orange[50]!;
    } else {
      statusColor = Colors.blue[700]!;
      statusBgColor = Colors.blue[50]!;
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
              builder: (context) => undawriter_insure_claim_detail.ClaimDetailScreen(claim: claim),
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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Claim #${claim['id']}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF061944)),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Policy: POL-${claim['policyId']}',
                        style: TextStyle(color: Colors.grey[600], fontSize: 13),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusBgColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ],
            ),
            const Divider(height: 32),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Payout Type', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      const SizedBox(height: 4),
                      Text(claim['payoutType']?.toString() ?? 'N/A', style: const TextStyle(fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Submitted On', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      const SizedBox(height: 4),
                      Text(
                        claim['createdAt'] != null 
                            ? DateTime.parse(claim['createdAt']).toLocal().toString().split(' ')[0]
                            : 'N/A', 
                        style: const TextStyle(fontWeight: FontWeight.w500)
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Description', style: TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 4),
            Text(
              claim['description']?.toString() ?? 'No description provided.',
              style: TextStyle(color: Colors.grey[800], fontSize: 14),
            ),
            if (claim['adjusterNotes'] != null && claim['adjusterNotes'].toString().isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!)
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Adjuster Notes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF4F98CD))),
                    const SizedBox(height: 4),
                    Text(claim['adjusterNotes'].toString(), style: const TextStyle(fontSize: 13)),
                  ],
                ),
              )
            ]
          ],
        ),
        ),
      ),
    );
  }
}

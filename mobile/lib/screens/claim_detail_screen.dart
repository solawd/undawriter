import 'package:flutter/material.dart';
import 'package:undawriter_insure/services/api_service.dart';

class ClaimDetailScreen extends StatefulWidget {
  final Map<String, dynamic> claim;

  const ClaimDetailScreen({super.key, required this.claim});

  @override
  State<ClaimDetailScreen> createState() => _ClaimDetailScreenState();
}

class _ClaimDetailScreenState extends State<ClaimDetailScreen> {
  bool _isLoading = true;
  List<dynamic> _messages = [];
  
  final TextEditingController _messageController = TextEditingController();
  int? _replyingTo;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    try {
      final messages = await ApiService.getClaimMessages(widget.claim['id'].toString());
      if (mounted) {
        setState(() {
          _messages = messages;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _postMessage() async {
    if (_messageController.text.trim().isEmpty) return;
    
    final text = _messageController.text;
    final parentId = _replyingTo;
    
    setState(() {
      _isLoading = true;
    });

    try {
      final newMsg = await ApiService.postClaimMessage(
        widget.claim['id'].toString(), 
        text, 
        parentId: parentId
      );
      
      setState(() {
        _messages.add(newMsg);
        _messageController.clear();
        _replyingTo = null;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to post message: $e')),
        );
      }
    }
  }

  Widget _buildMessageNode(Map<String, dynamic> msg, int depth) {
    final bool isStaff = msg['userProfile'] == 'STAFF' || msg['userProfile'] == 'ADMIN';
    final children = _messages.where((m) => m['parentId'] == msg['id']).toList();
    
    return Padding(
      padding: EdgeInsets.only(left: depth * 16.0, bottom: 8.0, top: 4.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isStaff ? Colors.blue[50] : Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isStaff ? Colors.blue[200]! : Colors.grey[300]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          msg['userFullName'] ?? 'Unknown',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isStaff ? Colors.blue[200] : Colors.grey[300],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            isStaff ? 'Staff' : 'Customer',
                            style: TextStyle(
                              fontSize: 10,
                              color: isStaff ? Colors.blue[900] : Colors.grey[800],
                            ),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      msg['createdAt'] != null ? DateTime.parse(msg['createdAt']).toLocal().toString().split('.')[0] : '',
                      style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(msg['message'] ?? ''),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _replyingTo = msg['id'];
                      });
                    },
                    child: Text(
                      'Reply',
                      style: TextStyle(color: Theme.of(context).primaryColor, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          if (_replyingTo == msg['id'])
            Padding(
              padding: const EdgeInsets.only(top: 8.0, left: 16.0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Replying to ${msg['userFullName']}',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => setState(() => _replyingTo = null),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send),
                    color: Theme.of(context).primaryColor,
                    onPressed: _postMessage,
                  ),
                ],
              ),
            ),
            
          if (children.isNotEmpty)
            ...children.map((child) => _buildMessageNode(child, depth + 1)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final claim = widget.claim;
    final topLevelMessages = _messages.where((m) => m['parentId'] == null).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('Claim #${claim['id']}'),
      ),
      body: Column(
        children: [
          // Claim Details Header
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Status: ${claim['status']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('Payout: ${claim['payoutType']}'),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('Description:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
                Text(claim['description'] ?? 'No description'),
              ],
            ),
          ),
          const Divider(height: 1),
          
          // Messages List
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : topLevelMessages.isEmpty
                ? const Center(child: Text('No messages yet. Start the conversation!'))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: topLevelMessages.length,
                    itemBuilder: (context, index) {
                      return _buildMessageNode(topLevelMessages[index], 0);
                    },
                  ),
          ),
          
          // Bottom Input Field (Only show if not replying to a specific message inline)
          if (_replyingTo == null)
            Container(
              padding: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.grey.withOpacity(0.2), spreadRadius: 1, blurRadius: 3, offset: const Offset(0, -1))
                ]
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Add a message...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      maxLines: null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: Theme.of(context).primaryColor,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white),
                      onPressed: _postMessage,
                    ),
                  )
                ],
              ),
            ),
        ],
      ),
    );
  }
}

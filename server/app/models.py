from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    photo_url = db.Column(db.Text)
    location = db.Column(db.String(255))
    availability = db.Column(db.Text)
    skills_offered = db.Column(db.Text)  # JSON string
    skills_wanted = db.Column(db.Text)   # JSON string
    is_public = db.Column(db.Boolean, default=True)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    is_banned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sent_requests = db.relationship('SwapRequest', foreign_keys='SwapRequest.from_user_id', backref='from_user', lazy=True)
    received_requests = db.relationship('SwapRequest', foreign_keys='SwapRequest.to_user_id', backref='to_user', lazy=True)
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'photo_url': self.photo_url,
            'location': self.location,
            'availability': self.availability,
            'skills_offered': json.loads(self.skills_offered) if self.skills_offered else [],
            'skills_wanted': json.loads(self.skills_wanted) if self.skills_wanted else [],
            'is_public': self.is_public,
            'role': self.role,
            'is_banned': self.is_banned,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class SwapRequest(db.Model):
    __tablename__ = 'swap_requests'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    from_user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    to_user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    skill_offered = db.Column(db.String(255), nullable=False)
    skill_wanted = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'accepted', 'rejected'
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chat_room = db.relationship('ChatRoom', backref='request', uselist=False, lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'from_user_id': self.from_user_id,
            'to_user_id': self.to_user_id,
            'from_user': self.from_user.to_dict() if self.from_user else None,
            'to_user': self.to_user.to_dict() if self.to_user else None,
            'skill_offered': self.skill_offered,
            'skill_wanted': self.skill_wanted,
            'status': self.status,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ChatRoom(db.Model):
    __tablename__ = 'chat_rooms'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user1_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    request_id = db.Column(db.String(36), db.ForeignKey('swap_requests.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='chat_room', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user1_id': self.user1_id,
            'user2_id': self.user2_id,
            'request_id': self.request_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    chat_room_id = db.Column(db.String(36), db.ForeignKey('chat_rooms.id'), nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'chat_room_id': self.chat_room_id,
            'sender_id': self.sender_id,
            'sender': self.sender.to_dict() if self.sender else None,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    request_id = db.Column(db.String(36), db.ForeignKey('swap_requests.id'), nullable=False)
    from_user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    to_user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer)  # 1-5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'request_id': self.request_id,
            'from_user_id': self.from_user_id,
            'to_user_id': self.to_user_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 
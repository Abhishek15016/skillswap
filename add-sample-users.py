#!/usr/bin/env python3
"""
Add Sample Users Script
This script adds sample users to the Skill Swap database for testing purposes.
"""

import sys
import os
import json
from datetime import datetime

# Add the server directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

from server.app import create_app
from server.app.models import db, User
from server.app.utils.auth import hash_password

def create_sample_users():
    """Create sample users for testing"""
    
    # Sample user data
    sample_users = [
        {
            'name': 'Ranjan Singh',
            'email': 'ranjan@example.com',
            'password': 'password123',
            'location': 'Lucknow, UP',
            'availability': 'Weekends and evenings after 6 PM',
            'skills_offered': ['JavaScript', 'React', 'Web Development', 'UI/UX Design'],
            'skills_wanted': ['Python', 'Data Science', 'Machine Learning'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Deepak Yadav',
            'email': 'deepak@example.com',
            'password': 'password123',
            'location': 'Saharanpur, UP',
            'availability': 'Weekdays 7-9 PM, Weekends',
            'skills_offered': ['Python', 'Data Analysis', 'SQL', 'Machine Learning'],
            'skills_wanted': ['JavaScript', 'React', 'Mobile Development'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Khushi Verma',
            'email': 'khushi@example.com',
            'password': 'password123',
            'location': 'Bangalore, TN',
            'availability': 'Flexible schedule, prefer mornings',
            'skills_offered': ['Graphic Design', 'Adobe Creative Suite', 'Branding', 'Illustration'],
            'skills_wanted': ['Photography', 'Video Editing', 'Social Media Marketing'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Aditya Mishra',
            'email': 'aditya@example.com',
            'password': 'password123',
            'location': 'Mumbai, MP',
            'availability': 'Evenings and weekends',
            'skills_offered': ['Photography', 'Video Production', 'Adobe Premiere', 'Lightroom'],
            'skills_wanted': ['Graphic Design', 'Web Development', 'Digital Marketing'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Sanya Dixit',
            'email': 'sanya@example.com',
            'password': 'password123',
            'location': 'Delhi, DL',
            'availability': 'Weekends only',
            'skills_offered': ['Spanish', 'French', 'Language Teaching', 'Translation'],
            'skills_wanted': ['Cooking', 'Baking', 'Nutrition', 'Fitness Training'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Mohit Dubey',
            'email': 'mohit@example.com',
            'password': 'password123',
            'location': 'Patna, BR',
            'availability': 'Weekdays 6-8 PM',
            'skills_offered': ['Cooking', 'Baking', 'Recipe Development', 'Food Photography'],
            'skills_wanted': ['Spanish', 'Guitar', 'Music Theory', 'Songwriting'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Shraddha Yadav',
            'email': 'shraddha@example.com',
            'password': 'password123',
            'location': 'Jaisalmer, RJ',
            'availability': 'Flexible, prefer afternoons',
            'skills_offered': ['Guitar', 'Piano', 'Music Theory', 'Songwriting'],
            'skills_wanted': ['Photography', 'Digital Art', 'Animation', '3D Modeling'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Raju Shukla',
            'email': 'raju@example.com',
            'password': 'password123',
            'location': 'Madras, TN',
            'availability': 'Weekends and holidays',
            'skills_offered': ['Fitness Training', 'Nutrition', 'Yoga', 'Meditation'],
            'skills_wanted': ['Cooking', 'Spanish', 'Dance', 'Salsa'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Dia Mishra',
            'email': 'dia@example.com',
            'password': 'password123',
            'location': 'Prayagraj, UP',
            'availability': 'Evenings after 7 PM',
            'skills_offered': ['Spanish', 'Portuguese', 'Translation', 'Language Teaching'],
            'skills_wanted': ['Acting', 'Public Speaking', 'Voice Training', 'Script Writing'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Ajit Jadon',
            'email': 'ajit@example.com',
            'password': 'password123',
            'location': 'Bhopal, MP',
            'availability': 'Weekdays 5-7 PM',
            'skills_offered': ['Acting', 'Public Speaking', 'Voice Training', 'Theater'],
            'skills_wanted': ['Writing', 'Creative Writing', 'Poetry', 'Screenwriting'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Kamal Rawat',
            'email': 'kamal@example.com',
            'password': 'password123',
            'location': 'Patna, BR',
            'availability': 'Weekends and holidays',
            'skills_offered': ['Writing', 'Creative Writing', 'Blogging', 'Content Creation'],
            'skills_wanted': ['Digital Marketing', 'SEO', 'Social Media Management', 'Analytics'],
            'is_public': True,
            'role': 'user'
        },
        {
            'name': 'Atul Bhandari',
            'email': 'atul@example.com',
            'password': 'password123',
            'location': 'Rewari, HR',
            'availability': 'Flexible schedule',
            'skills_offered': ['Digital Marketing', 'SEO', 'Social Media Management', 'Google Ads'],
            'skills_wanted': ['Web Development', 'WordPress', 'E-commerce', 'Shopify'],
            'is_public': True,
            'role': 'user'
        }
    ]
    
    app = create_app()
    
    with app.app_context():
        print("🚀 Starting to add sample users...")
        
        # Check if users already exist
        existing_users = User.query.all()
        if existing_users:
            print(f"⚠️  Found {len(existing_users)} existing users in the database.")
            response = input("Do you want to continue and add sample users? (y/N): ")
            if response.lower() != 'y':
                print("❌ Operation cancelled.")
                return
        
        # Create sample users
        created_count = 0
        for user_data in sample_users:
            try:
                # Check if user already exists
                existing_user = User.query.filter_by(email=user_data['email']).first()
                if existing_user:
                    print(f"⚠️  User {user_data['email']} already exists, skipping...")
                    continue
                
                # Create new user
                user = User(
                    email=user_data['email'],
                    password_hash=hash_password(user_data['password']),
                    name=user_data['name'],
                    location=user_data['location'],
                    availability=user_data['availability'],
                    skills_offered=json.dumps(user_data['skills_offered']),
                    skills_wanted=json.dumps(user_data['skills_wanted']),
                    is_public=user_data['is_public'],
                    role=user_data['role']
                )
                
                db.session.add(user)
                created_count += 1
                print(f"✅ Created user: {user_data['name']} ({user_data['email']})")
                
            except Exception as e:
                print(f"❌ Error creating user {user_data['email']}: {str(e)}")
                db.session.rollback()
        
        # Commit all changes
        try:
            db.session.commit()
            print(f"\n🎉 Successfully created {created_count} sample users!")
            print(f"📊 Total users in database: {User.query.count()}")
            
            # Display sample login credentials
            print("\n📋 Sample Login Credentials:")
            print("=" * 50)
            for user_data in sample_users[:5]:  # Show first 5 users
                print(f"Email: {user_data['email']}")
                print(f"Password: {user_data['password']}")
                print(f"Name: {user_data['name']}")
                print("-" * 30)
            
            if len(sample_users) > 5:
                print(f"... and {len(sample_users) - 5} more users")
            
        except Exception as e:
            print(f"❌ Error committing to database: {str(e)}")
            db.session.rollback()

def main():
    """Main function"""
    print("🎯 Skill Swap - Add Sample Users")
    print("=" * 40)
    
    try:
        create_sample_users()
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
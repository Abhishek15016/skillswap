#!/usr/bin/env python3
"""
Admin User Creation Script for Skill Swap Platform
This script creates an admin user in the SQLite database.
"""

import os
import sys

def create_admin_user():
    """Create admin user in SQLite database"""
    try:
        # Add server directory to Python path
        server_dir = os.path.join(os.path.dirname(__file__), 'server')
        sys.path.insert(0, server_dir)
        
        # Import the app.py file directly to avoid package/module conflict
        import importlib.util
        spec = importlib.util.spec_from_file_location("app_module", os.path.join(server_dir, "app.py"))
        app_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(app_module)
        
        from app.models import db, User
        from app.utils.auth import hash_password
        
        app_instance = app_module.create_app()
        
        with app_instance.app_context():
            # Initialize database (create tables if they don't exist)
            db.create_all()
            
            # Check if admin user already exists
            admin_user = User.query.filter_by(email='admin@skillswap.com').first()
            if admin_user:
                print("⚠️  Admin user already exists!")
                return
            
            # Create admin user
            admin = User(
                email='admin@skillswap.com',
                password_hash=hash_password('admin123'),
                name='Admin User',
                role='admin',
                is_public=False,
                skills_offered='["Platform Administration"]',
                skills_wanted='["User Feedback"]'
            )
            
            db.session.add(admin)
            db.session.commit()
            
            print("✅ Admin user created successfully!")
            print("📧 Email: admin@skillswap.com")
            print("🔑 Password: admin123")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def main():
    print("🚀 Skill Swap Platform - Admin User Creation")
    print("=" * 50)
    
    # Ask for confirmation
    print("\nThis script will create an admin user with the following credentials:")
    print("Email: admin@skillswap.com")
    print("Password: admin123")
    
    confirm = input("\nDo you want to continue? (y/N): ").strip().lower()
    
    if confirm not in ['y', 'yes']:
        print("❌ Admin user creation cancelled.")
        sys.exit(0)
    
    create_admin_user()

if __name__ == "__main__":
    main() 
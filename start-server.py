#!/usr/bin/env python3
"""
Startup Script for Skill Swap Platform
This script checks the database and starts the Flask server.
"""

import os
import sys
import subprocess
import time

def check_and_start():
    """Check database and start server"""
    try:
        print("🚀 Skill Swap Platform - Server Startup")
        print("=" * 50)
        
        # Add server directory to Python path
        server_dir = os.path.join(os.path.dirname(__file__), 'server')
        sys.path.insert(0, server_dir)
        
        # Import the app.py file directly
        import importlib.util
        spec = importlib.util.spec_from_file_location("app_module", os.path.join(server_dir, "app.py"))
        app_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(app_module)
        
        from app.models import db, User
        
        app_instance = app_module.create_app()
        
        with app_instance.app_context():
            # Check if database file exists
            db_path = os.path.join(server_dir, 'skill_swap.db')
            if not os.path.exists(db_path):
                print("📊 Creating database...")
                db.create_all()
                print("✅ Database created successfully!")
            else:
                print(f"✅ Database exists: {os.path.getsize(db_path)} bytes")
            
            # Check if users exist
            user_count = User.query.count()
            print(f"👥 Users in database: {user_count}")
            
            if user_count == 0:
                print("⚠️  No users found. Creating admin user...")
                from app.utils.auth import hash_password
                
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
                print("✅ Admin user created!")
                print("📧 Email: admin@skillswap.com")
                print("🔑 Password: admin123")
        
        print("\n Starting Flask server...")
        print("Server will be available at: http://localhost:5000")
        print("API endpoints: http://localhost:5000/api/")
        print("\nPress Ctrl+C to stop the server")
        print("=" * 50)
        
        # Start the Flask server
        os.chdir(server_dir)
        subprocess.run([sys.executable, "app.py"])
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    check_and_start() 
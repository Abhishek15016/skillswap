from flask import Blueprint, request, jsonify
from app.models import db, User
from app.utils.auth import require_auth, get_current_user
import os
import json
from werkzeug.utils import secure_filename

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
def get_users():
    """Get public users with pagination and search"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search', '')
        
        offset = (page - 1) * limit
        
        # Get current user if authenticated
        current_user = get_current_user()
        current_user_id = current_user.id if current_user else None
        
        if search:
            # Search by skills - exclude admin users and current user
            skills = [skill.strip() for skill in search.split(',')]
            users = User.query.filter(
                User.is_public == True,
                User.role != 'admin',
                User.id != current_user_id
            ).all()
            
            # Filter by skills
            filtered_users = []
            for user in users:
                user_skills = user.to_dict()['skills_offered'] + user.to_dict()['skills_wanted']
                if any(skill.lower() in [s.lower() for s in user_skills] for skill in skills):
                    filtered_users.append(user)
            
            users = filtered_users[offset:offset + limit]
            
            users_data = [user.to_dict() for user in users]
            print(f"✅ Returning {len(users_data)} users from search (excluded admin users and current user)")
            print(f"🔍 Current user ID: {current_user_id}")
            print(f"🔍 Users returned: {[u['name'] for u in users_data]}")
        else:
            # Get all public users - exclude admin users and current user
            users = User.query.filter(
                User.is_public == True,
                User.role != 'admin',
                User.id != current_user_id
            ).offset(offset).limit(limit).all()
        
        users_data = [user.to_dict() for user in users]
        print(f"✅ Returning {len(users_data)} users (excluded admin users and current user)")
        print(f"🔍 Current user ID: {current_user_id}")
        print(f"🔍 Users returned: {[u['name'] for u in users_data]}")
        
        return jsonify({
            'users': users_data,
            'page': page,
            'limit': limit,
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get specific user profile"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is public or if current user is requesting their own profile
        current_user = get_current_user()
        if not user.is_public and (not current_user or current_user.id != user_id):
            return jsonify({'error': 'User profile is private'}), 403
        
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    """Update user profile"""
    try:
        current_user = get_current_user()
        if current_user.id != user_id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get the user to update
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        print(f"🔧 Updating user {user_id} with data: {data}")
        
        # Fields that can be updated
        allowed_fields = ['name', 'location', 'availability', 'skills_offered', 'skills_wanted', 'is_public']
        
        for field in allowed_fields:
            if field in data:
                if field in ['skills_offered', 'skills_wanted']:
                    # Ensure skills are stored as JSON string
                    if isinstance(data[field], list):
                        setattr(user, field, json.dumps(data[field]))
                    else:
                        setattr(user, field, data[field])
                    print(f"🔧 Updated {field}: {data[field]}")
                else:
                    setattr(user, field, data[field])
                    print(f"🔧 Updated {field}: {data[field]}")
        
        db.session.commit()
        print(f"✅ User {user_id} updated successfully")
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>/photo', methods=['POST'])
@require_auth
def upload_photo(user_id):
    """Upload user profile photo"""
    try:
        current_user = get_current_user()
        if current_user.id != user_id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get the user to update
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400
        
        file = request.files['photo']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"🔧 Uploading photo for user {user_id}: {file.filename}")
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Create uploads directory if it doesn't exist
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            print(f"📁 Created uploads directory: {upload_folder}")
        
        # Save file
        filename = secure_filename(f"{user_id}_{file.filename}")
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        print(f"💾 Saved file: {file_path}")
        
        # Update user profile with photo URL
        # Use the API base URL instead of request.host_url
        photo_url = f"http://localhost:5000/uploads/{filename}"
        user.photo_url = photo_url
        db.session.commit()
        
        print(f"✅ Photo uploaded successfully for user {user_id}")
        
        return jsonify({
            'message': 'Photo uploaded successfully',
            'photo_url': photo_url,
            'user': user.to_dict()
        }), 200
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error uploading photo for user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@users_bp.route('/search', methods=['GET'])
def search_users():
    """Search users by skills"""
    try:
        skills = request.args.get('skills', '')
        if not skills:
            return jsonify({'error': 'Skills parameter is required'}), 400
        
        # Get current user if authenticated
        current_user = get_current_user()
        current_user_id = current_user.id if current_user else None
        
        skill_list = [skill.strip() for skill in skills.split(',')]
        users = User.query.filter(
            User.is_public == True,
            User.role != 'admin',
            User.id != current_user_id
        ).all()
        
        # Filter by skills
        filtered_users = []
        for user in users:
            user_skills = user.to_dict()['skills_offered'] + user.to_dict()['skills_wanted']
            if any(skill.lower() in [s.lower() for s in user_skills] for skill in skill_list):
                filtered_users.append(user)
        
        users_data = [user.to_dict() for user in filtered_users]
        print(f"✅ Search returning {len(users_data)} users (excluded admin users and current user)")
        print(f"🔍 Current user ID: {current_user_id}")
        print(f"🔍 Users returned: {[u['name'] for u in users_data]}")
        
        return jsonify({
            'users': users_data,
            'total': len(filtered_users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>/password', methods=['PUT'])
@require_auth
def change_password(user_id):
    """Change user password"""
    try:
        current_user = get_current_user()
        if current_user.id != user_id and current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get the user to update
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Verify current password
        from app.utils.auth import verify_password
        if not verify_password(current_password, user.password_hash):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Hash new password
        from app.utils.auth import hash_password
        user.password_hash = hash_password(new_password)
        
        db.session.commit()
        print(f"✅ Password changed successfully for user {user_id}")
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error changing password for user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500 
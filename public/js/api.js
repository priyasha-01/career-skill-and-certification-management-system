// Centralized API handler for the Student Skill and Certification Management System
const BASE_URL = '/api/v1';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // Set headers
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    
    const config = {
        ...options,
        headers
    };
    
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, config);
        
        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Something went wrong with the network request.');
        }
        
        return data;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}

const API = {
    // --- Students API ---
    getStudents: (search = '', department = '') => {
        let params = new URLSearchParams();
        if (search) params.append('search', search);
        if (department) params.append('department', department);
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        return request(`/students/${queryStr}`);
    },
    
    getStudentProfile: (id) => request(`/students/${id}`),
    
    createStudent: (studentData) => request('/students/', {
        method: 'POST',
        body: studentData
    }),
    
    updateStudent: (id, studentData) => request(`/students/${id}`, {
        method: 'PUT',
        body: studentData
    }),
    
    deleteStudent: (id) => request(`/students/${id}`, {
        method: 'DELETE'
    }),
    
    // --- Skills Catalog API ---
    getSkills: (category = '') => {
        const queryStr = category ? `?category=${encodeURIComponent(category)}` : '';
        return request(`/skills/${queryStr}`);
    },
    
    createSkill: (skillData) => request('/skills/', {
        method: 'POST',
        body: skillData
    }),
    
    // --- Student Skill Assignments API ---
    assignSkill: (studentId, skillAssignment) => request(`/skills/${studentId}/assign`, {
        method: 'POST',
        body: skillAssignment
    }),
    
    updateStudentSkill: (studentId, skillId, skillData) => request(`/skills/${studentId}/skills/${skillId}`, {
        method: 'PUT',
        body: skillData
    }),
    
    removeStudentSkill: (studentId, skillId) => request(`/skills/${studentId}/skills/${skillId}`, {
        method: 'DELETE'
    }),
    
    // --- Certifications API ---
    getCertifications: (studentId = '', status = '') => {
        let params = new URLSearchParams();
        if (studentId) params.append('student_id', studentId);
        if (status) params.append('status', status);
        const queryStr = params.toString() ? `?${params.toString()}` : '';
        return request(`/certifications/${queryStr}`);
    },
    
    createCertification: (studentId, certData) => request(`/certifications/${studentId}`, {
        method: 'POST',
        body: certData
    }),
    
    updateCertification: (certId, certData) => request(`/certifications/${certId}`, {
        method: 'PUT',
        body: certData
    }),
    
    deleteCertification: (certId) => request(`/certifications/${certId}`, {
        method: 'DELETE'
    }),
    
    // --- Analytics API ---
    getAnalytics: () => request('/analytics/summary')
};

// Bind to window for global access across scripts
window.API = API;

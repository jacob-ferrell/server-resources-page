from flask import Flask, jsonify, render_template
import psutil, subprocess

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/system', methods=['GET'])
def get_system_info():
    cpu_percent = psutil.cpu_percent(interval=1)
    memory_info = psutil.virtual_memory()
    disk_usage = psutil.disk_usage('/')
    external_hdd_usage = psutil.disk_usage('/hdd/')
    temps = psutil.sensors_temperatures();
    system_info = {
        'temp': temps['coretemp'][0][1],
        'cpu_percent': cpu_percent,
        'memory': {
            'total': memory_info.total,
            'available': memory_info.available,
            'percent': memory_info.percent,
            'used': memory_info.used,
            'free': memory_info.free
        },
        'disk': {
            'total': disk_usage.total,
            'used': disk_usage.used,
            'free': disk_usage.free,
            'percent': disk_usage.percent
        },
        'external_disk': {
            'total': external_hdd_usage.total,
            'used': external_hdd_usage.used,
            'free': external_hdd_usage.free,
            'percent': external_hdd_usage.percent
        }
    }
    return jsonify(system_info)

@app.route('/api/apps', methods = ['GET'])
def get_app_usage():
    result = subprocess.run(['pm2', 'list'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"Error running pm2 list: {result.stderr}")
    
    # Split the output into lines
    lines = result.stdout.splitlines()

    print(lines)

    # Initialize a dictionary to store the process memory usage
    memory_usage = {}

    # Find the line that contains the process details
    for line in lines:
        # Skip the lines that do not contain process info
        if '│' not in line or 'id' in line or 'name' in line:
            continue
        
        # Split the line into columns by the pipe symbol │
        columns = line.split('│')
        
        # Strip extra whitespace and extract the name and memory columns
        process_name = columns[2].strip()
        memory_used = columns[11].strip()

        # Add to the dictionary
        memory_usage[process_name] = memory_used
    
    return memory_usage

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


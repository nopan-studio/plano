import re
import os

def update_css():
    # Update dashboard.css
    d_path = 'static/css/dashboard.css'
    with open(d_path, 'r') as f:
        d_css = f.read()

    # Remove :root block from dashboard.css
    d_css = re.sub(r':root\s*\{[^}]*\}\s*', '', d_css)
    
    # Replace variables
    reps = {
        '--b2': '--border2',
        '--b)': '--border)',
        '--b;': '--border;',
        '--mid': '--text-mid',
        '--dim': '--text-dim',
        '--surf2': '--surface2',
        '--surf': '--surface',
        '--acc': '--accent',
        '--acc-g': '--accent-glow',
        '--acc-d': '--accent-dim',
    }
    for old, new in reps.items():
        d_css = d_css.replace(old, new)
        
    # Remove glassmorphism
    d_css = re.sub(r'backdrop-filter:[^;]+;', '', d_css)
    d_css = re.sub(r'-webkit-backdrop-filter:[^}]+;', '', d_css)
    
    # Revert HTML/body background
    d_css = re.sub(r'background:linear-gradient[^;]+;', 'background:var(--bg);', d_css)
    d_css = re.sub(r'background-attachment:fixed;', '', d_css)
    
    with open(d_path, 'w') as f:
        f.write(d_css)
        
    # Update index.css
    i_path = 'static/css/index.css'
    with open(i_path, 'r') as f:
        i_css = f.read()

    # We keep :root in index.css but point to standard variables
    i_css = re.sub(r':root\s*\{[^}]*\}', 
    '''/* Variables inherited from theme.css */
:root {
  --canvas-bg:    #0a0a0c;
  --dot-color:    #27272a;
  --node-bg:      var(--panel2);
  --node-border:  var(--border);
  --shadow:       0 8px 32px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.4);
}''', i_css)

    # replace index.css colors
    reps = {
        '--panel-bg': '--panel',
        '--panel-border': '--border',
        '--text-mid': '--text-mid',
        '--text-dim': '--text-dim',
        '--surface2': '--surface2',
    }
    for old, new in reps.items():
        i_css = i_css.replace(old, new)
        
    i_css = re.sub(r'backdrop-filter:[^;]+;', '', i_css)
    i_css = re.sub(r'-webkit-backdrop-filter:[^}]+;', '', i_css)
    
    with open(i_path, 'w') as f:
        f.write(i_css)

    # Remove :root from tester.css
    t_path = 'static/css/tester.css'
    with open(t_path, 'r') as f:
        t_css = f.read()
    t_css = re.sub(r':root\s*\{[^}]*\}\s*', '', t_css)
    with open(t_path, 'w') as f:
        f.write(t_css)

    # Add <link rel="stylesheet" href="/static/css/theme.css"> to the 3 html files
    for html in ['templates/dashboard.html', 'templates/index.html', 'templates/tester.html']:
        with open(html, 'r') as f:
            content = f.read()
        if 'theme.css' not in content:
            content = content.replace('</head>', '    <link rel="stylesheet" href="{{ url_for(\'static\', filename=\'css/theme.css\') }}">\n</head>')
            with open(html, 'w') as f:
                f.write(content)

update_css()
print("Updated CSS and HTML files.")

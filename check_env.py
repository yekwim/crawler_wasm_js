#!/usr/bin/env python3
"""Verifica se o ambiente está configurado corretamente"""

import sys
import importlib
import subprocess
import os

def check_package(package_name, import_name=None):
    if import_name is None:
        import_name = package_name
    
    try:
        importlib.import_module(import_name)
        print(f"✅ {package_name}")
        return True
    except ImportError:
        print(f"❌ {package_name}")
        return False

def check_playwright_browsers():
    try:
        result = subprocess.run(['playwright', 'install', '--dry-run'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ Playwright browsers")
            return True
        else:
            print("❌ Playwright browsers")
            return False
    except Exception:
        print("❌ Playwright browsers")
        return False

def check_virtual_env():
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Ambiente virtual ativo")
        print(f"   Localização: {sys.prefix}")
        return True
    else:
        print("❌ Nenhum ambiente virtual ativo")
        return False

def main():
    print("🔍 Verificando ambiente...")
    print("=" * 50)
    
    # Verifica ambiente virtual
    venv_ok = check_virtual_env()
    print()
    
    # Verifica pacotes Python
    print("📦 Dependências Python:")
    packages = [
        ("playwright", "playwright"),
        ("jsbeautifier", "jsbeautifier"),
        ("esprima", "esprima"),
    ]
    
    packages_ok = True
    for package, import_name in packages:
        if not check_package(package, import_name):
            packages_ok = False
    
    print()
    
    # Verifica browsers do Playwright
    print("🌐 Browsers do Playwright:")
    browsers_ok = check_playwright_browsers()
    
    print()
    print("=" * 50)
    
    if venv_ok and packages_ok and browsers_ok:
        print("✅ Ambiente configurado corretamente!")
        print("🚀 Pronto para usar o projeto!")
    else:
        print("❌ Algumas dependências estão faltando.")
        print("Execute: ./setup_env.sh")
        sys.exit(1)

if __name__ == "__main__":
    main()

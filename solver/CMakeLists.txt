cmake_minimum_required(VERSION 3.10)

# set the project name
project("FreeQL")
#set(CMAKE_VERBOSE_MAKEFILE on)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_subdirectory(AQSystemSolver)
add_executable(JS_AQSystemSolver JS_AQSystemSolver.cpp)

set(CMAKE_CXX_COMPILER ${EMCC})
set_target_properties(JS_AQSystemSolver PROPERTIES OUTPUT_NAME "JS_AQSystemSolver.js")
if (CMAKE_BUILD_TYPE EQUAL "DEBUG" OR NOT DEFINED(CMAKE_BUILD_TYPE))
    set_target_properties(JS_AQSystemSolver PROPERTIES LINK_FLAGS "-s DISABLE_EXCEPTION_CATCHING=0 -s LLD_REPORT_UNDEFINED -s --extern-pre-js ${PROJECT_SOURCE_DIR}/prepend.txt -s MODULARIZE=1 -s ALLOW_MEMORY_GROWTH=1 --no-entry --bind")
else()
    set_target_properties(JS_AQSystemSolver PROPERTIES LINK_FLAGS "-s LLD_REPORT_UNDEFINED -s --extern-pre-js ${PROJECT_SOURCE_DIR}/prepend.txt -s MODULARIZE=1 -s ALLOW_MEMORY_GROWTH=1 --no-entry --bind")
endif()

target_link_libraries(JS_AQSystemSolver PUBLIC AQSystemSolver)
target_include_directories(JS_AQSystemSolver PUBLIC "${PROJECT_SOURCE_DIR}/AQSystemSolver")
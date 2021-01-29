add_library(AQSystemSolver AQSystemSolver.hpp SM_utils.hpp)

set_target_properties(AQSystemSolver PROPERTIES LINKER_LANGUAGE CXX)

find_package (Eigen3 REQUIRED)

target_link_libraries(AQSystemSolver PUBLIC Eigen3::Eigen)